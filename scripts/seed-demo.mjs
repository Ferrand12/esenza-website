#!/usr/bin/env node
/**
 * Seed de demostración para Esenza.
 *
 * Usa el service role key (bypass RLS) y crea data realista:
 * - ~15 huéspedes (colombianos y extranjeros, con tags variados)
 * - ~25 reservas distribuidas en pasado/presente/futuro
 * - Bloqueos manuales + bloqueos importados de Airbnb
 * - Comunicaciones recientes
 * - Log de sincronización
 *
 * Idempotente: todo lo marcado como "demo" se borra y recrea.
 *
 * Ejecutar:  node scripts/seed-demo.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Cargar .env.local manualmente (Node no lo hace solo)
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envText = readFileSync(envPath, "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
} catch (e) {
  console.error("No pude leer .env.local:", e.message);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------
const DEMO_TAG = "demo";
const DEMO_BLOCK_PREFIX = "Demo · ";
const DEMO_AIRBNB_EXTERNAL_PREFIX = "demo-airbnb-";
const DEMO_SYNC_SOURCE = "demo-airbnb";

function daysFromToday(n) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function pkg(price) {
  return price;
}

async function must(label, p) {
  const { error } = await p;
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    throw error;
  }
  console.log(`✓ ${label}`);
}

// -------------------------------------------------------------------------
// 1. Limpiar data previa de demo
// -------------------------------------------------------------------------
console.log("\n⟶ Limpiando data previa de demo…");

const { data: demoGuests } = await sb
  .from("guests")
  .select("id")
  .contains("tags", [DEMO_TAG]);
const demoGuestIds = (demoGuests ?? []).map((g) => g.id);

if (demoGuestIds.length > 0) {
  await must(
    "Borradas comunicaciones demo",
    sb.from("communications").delete().in("guest_id", demoGuestIds),
  );
  await must(
    "Borradas reservas demo",
    sb.from("bookings").delete().in("guest_id", demoGuestIds),
  );
  await must(
    "Borrados huéspedes demo",
    sb.from("guests").delete().in("id", demoGuestIds),
  );
}

await must(
  "Borrados bloqueos manuales demo",
  sb.from("calendar_blocks").delete().like("reason", `${DEMO_BLOCK_PREFIX}%`),
);
await must(
  "Borrados bloqueos Airbnb demo",
  sb
    .from("calendar_blocks")
    .delete()
    .like("external_id", `${DEMO_AIRBNB_EXTERNAL_PREFIX}%`),
);
await must(
  "Borrado sync_log demo",
  sb.from("sync_log").delete().eq("source", DEMO_SYNC_SOURCE),
);

// -------------------------------------------------------------------------
// 2. Huéspedes
// -------------------------------------------------------------------------
console.log("\n⟶ Insertando huéspedes…");

const guestsInput = [
  // Colombianos
  {
    full_name: "Ana Restrepo",
    email: "ana.restrepo@example.com",
    phone: "+573001112233",
    country: "Colombia",
    tags: [DEMO_TAG, "yoga", "retiro"],
    notes: "Vegetariana. Alérgica a frutos secos.",
  },
  {
    full_name: "Carlos Gutiérrez",
    email: "cgutierrez@example.com",
    phone: "+573134567890",
    country: "Colombia",
    tags: [DEMO_TAG, "vip", "empresarial"],
    notes: "CEO de startup bogotana. Prefiere fines de semana sin WiFi.",
  },
  {
    full_name: "Valeria Ospina",
    email: "valeria.o@example.com",
    phone: "+573102223344",
    country: "Colombia",
    tags: [DEMO_TAG, "yoga"],
  },
  {
    full_name: "Diana Morales",
    email: "dianam@example.com",
    phone: "+573158889900",
    country: "Colombia",
    tags: [DEMO_TAG, "aniversario", "vip"],
    notes: "Celebra 10 años de matrimonio.",
  },
  {
    full_name: "Andrés Quintero",
    email: "andresq@example.com",
    phone: "+573205556677",
    country: "Colombia",
    tags: [DEMO_TAG],
  },
  {
    full_name: "María Camila Torres",
    email: "mctorres@example.com",
    phone: "+573101234567",
    country: "Colombia",
    tags: [DEMO_TAG, "retiro", "yoga"],
  },
  {
    full_name: "Juan Pablo Rincón",
    email: "jprincon@example.com",
    phone: "+573116667788",
    country: "Colombia",
    tags: [DEMO_TAG],
  },
  {
    full_name: "Laura Sánchez",
    email: "laurasanchez@example.com",
    phone: "+573129998877",
    country: "Colombia",
    tags: [DEMO_TAG, "vip"],
  },
  // Extranjeros
  {
    full_name: "Luis Méndez",
    email: "lmendez@example.com",
    phone: "+525544556677",
    country: "México",
    tags: [DEMO_TAG, "aniversario"],
    notes: "Habla español. Viene por segunda vez.",
  },
  {
    full_name: "Emma Johansson",
    email: "emma.j@example.com",
    phone: "+46701234567",
    country: "Suecia",
    tags: [DEMO_TAG, "yoga"],
    notes: "Instructora de yoga. Busca tranquilidad total.",
  },
  {
    full_name: "Roberto Silva",
    email: "rsilva@example.com",
    phone: "+5511987654321",
    country: "Brasil",
    tags: [DEMO_TAG, "vip"],
  },
  {
    full_name: "Isabella Fernández",
    email: "isabellaf@example.com",
    phone: "+34655443322",
    country: "España",
    tags: [DEMO_TAG, "retiro"],
  },
  {
    full_name: "Michael Chen",
    email: "mchen@example.com",
    phone: "+14155551234",
    country: "Estados Unidos",
    tags: [DEMO_TAG, "empresarial"],
  },
  {
    full_name: "Sofía Vargas",
    email: "svargas@example.com",
    phone: "+573017778899",
    country: "Colombia",
    tags: [DEMO_TAG],
  },
  {
    full_name: "Pedro Jiménez",
    email: "pjimenez@example.com",
    phone: "+573145556677",
    country: "Colombia",
    tags: [DEMO_TAG, "yoga"],
  },
];

const { data: guests, error: gErr } = await sb
  .from("guests")
  .insert(guestsInput)
  .select("id, full_name, email");

if (gErr) {
  console.error("✗ Error insertando huéspedes:", gErr.message);
  process.exit(1);
}
console.log(`✓ ${guests.length} huéspedes insertados`);

const byEmail = Object.fromEntries(guests.map((g) => [g.email, g]));
const gid = (email) => byEmail[email]?.id;

// -------------------------------------------------------------------------
// 3. Reservas
// -------------------------------------------------------------------------
console.log("\n⟶ Insertando reservas…");

// Precios por noche (COP)
const PRICE = { esencia: 350000, armonia: 650000, plenitud: 900000 };

function nights(ci, co) {
  return Math.round(
    (new Date(co).getTime() - new Date(ci).getTime()) / (1000 * 60 * 60 * 24),
  );
}
function totalFor(pkgName, ci, co) {
  return PRICE[pkgName] * nights(ci, co);
}

const bookingsInput = [
  // ---- PASADAS (completadas) ----
  {
    guest_id: gid("ana.restrepo@example.com"),
    check_in: daysFromToday(-120),
    check_out: daysFromToday(-117),
    num_guests: 2,
    package: "armonia",
    status: "completed",
    source: "web",
    special_requests: "Menú vegetariano sin frutos secos",
  },
  {
    guest_id: gid("lmendez@example.com"),
    check_in: daysFromToday(-90),
    check_out: daysFromToday(-87),
    num_guests: 2,
    package: "plenitud",
    status: "completed",
    source: "whatsapp",
    special_requests: "Aniversario · cena privada en terraza",
  },
  {
    guest_id: gid("svargas@example.com"),
    check_in: daysFromToday(-60),
    check_out: daysFromToday(-58),
    num_guests: 1,
    package: "esencia",
    status: "completed",
    source: "web",
  },
  {
    guest_id: gid("mctorres@example.com"),
    check_in: daysFromToday(-45),
    check_out: daysFromToday(-42),
    num_guests: 3,
    package: "armonia",
    status: "completed",
    source: "airbnb",
    external_id: "airbnb-past-1",
  },
  {
    guest_id: gid("isabellaf@example.com"),
    check_in: daysFromToday(-30),
    check_out: daysFromToday(-27),
    num_guests: 2,
    package: "plenitud",
    status: "completed",
    source: "web",
  },
  {
    guest_id: gid("mchen@example.com"),
    check_in: daysFromToday(-20),
    check_out: daysFromToday(-17),
    num_guests: 4,
    package: "armonia",
    status: "completed",
    source: "manual",
    special_requests: "Retiro corporativo · necesitan proyector",
  },

  // ---- EN CURSO (check-in ya pasó, check-out en el futuro) ----
  {
    guest_id: gid("cgutierrez@example.com"),
    check_in: daysFromToday(-2),
    check_out: daysFromToday(2),
    num_guests: 2,
    package: "plenitud",
    status: "confirmed",
    source: "web",
    special_requests: "Sin WiFi en la habitación por favor",
  },

  // ---- PRÓXIMAS CONFIRMADAS ----
  {
    guest_id: gid("valeria.o@example.com"),
    check_in: daysFromToday(7),
    check_out: daysFromToday(10),
    num_guests: 2,
    package: "armonia",
    status: "confirmed",
    source: "web",
  },
  {
    guest_id: gid("andresq@example.com"),
    check_in: daysFromToday(14),
    check_out: daysFromToday(16),
    num_guests: 2,
    package: "esencia",
    status: "confirmed",
    source: "web",
  },
  {
    guest_id: gid("dianam@example.com"),
    check_in: daysFromToday(21),
    check_out: daysFromToday(25),
    num_guests: 2,
    package: "plenitud",
    status: "confirmed",
    source: "whatsapp",
    special_requests: "Decoración de aniversario · rosas blancas",
  },
  {
    guest_id: gid("rsilva@example.com"),
    check_in: daysFromToday(28),
    check_out: daysFromToday(31),
    num_guests: 4,
    package: "plenitud",
    status: "confirmed",
    source: "airbnb",
    external_id: "airbnb-upcoming-1",
  },
  {
    guest_id: gid("emma.j@example.com"),
    check_in: daysFromToday(35),
    check_out: daysFromToday(42),
    num_guests: 1,
    package: "esencia",
    status: "confirmed",
    source: "web",
    special_requests: "Retiro silencioso de 7 días · dieta vegana",
  },

  // ---- PENDIENTES ----
  {
    guest_id: gid("pjimenez@example.com"),
    check_in: daysFromToday(50),
    check_out: daysFromToday(53),
    num_guests: 2,
    package: "armonia",
    status: "pending",
    source: "web",
  },
  {
    guest_id: gid("laurasanchez@example.com"),
    check_in: daysFromToday(60),
    check_out: daysFromToday(64),
    num_guests: 3,
    package: "plenitud",
    status: "pending",
    source: "whatsapp",
    special_requests: "Cumpleaños sorpresa · necesita confirmación de torta",
  },
  {
    guest_id: gid("jprincon@example.com"),
    check_in: daysFromToday(72),
    check_out: daysFromToday(74),
    num_guests: 2,
    package: "esencia",
    status: "pending",
    source: "web",
  },

  // ---- CANCELADAS (no bloquean fechas) ----
  {
    guest_id: gid("mctorres@example.com"),
    check_in: daysFromToday(5),
    check_out: daysFromToday(8),
    num_guests: 2,
    package: "armonia",
    status: "cancelled",
    source: "web",
    internal_notes: "Canceló por enfermedad familiar.",
  },
  {
    guest_id: gid("svargas@example.com"),
    check_in: daysFromToday(45),
    check_out: daysFromToday(47),
    num_guests: 1,
    package: "esencia",
    status: "cancelled",
    source: "web",
    internal_notes: "Pidió reembolso · procesado.",
  },
];

const bookingsToInsert = bookingsInput.map((b) => ({
  ...b,
  total_price: totalFor(b.package, b.check_in, b.check_out),
}));

const { data: bookings, error: bErr } = await sb
  .from("bookings")
  .insert(bookingsToInsert)
  .select("id, guest_id, check_in, check_out, status, package");

if (bErr) {
  console.error("✗ Error insertando reservas:", bErr.message);
  process.exit(1);
}
console.log(`✓ ${bookings.length} reservas insertadas`);

// -------------------------------------------------------------------------
// 4. Bloqueos de calendario
// -------------------------------------------------------------------------
console.log("\n⟶ Insertando bloqueos de calendario…");

const blocksInput = [
  // Manuales
  {
    start_date: daysFromToday(17),
    end_date: daysFromToday(20),
    reason: `${DEMO_BLOCK_PREFIX}Mantenimiento piscina`,
    source: "manual",
  },
  {
    start_date: daysFromToday(80),
    end_date: daysFromToday(84),
    reason: `${DEMO_BLOCK_PREFIX}Uso propio de la familia`,
    source: "manual",
  },
  // Importados de Airbnb
  {
    start_date: daysFromToday(44),
    end_date: daysFromToday(48),
    reason: null,
    source: "airbnb_sync",
    external_id: `${DEMO_AIRBNB_EXTERNAL_PREFIX}001`,
  },
  {
    start_date: daysFromToday(95),
    end_date: daysFromToday(98),
    reason: null,
    source: "airbnb_sync",
    external_id: `${DEMO_AIRBNB_EXTERNAL_PREFIX}002`,
  },
];

await must(
  `${blocksInput.length} bloqueos insertados`,
  sb.from("calendar_blocks").insert(blocksInput),
);

// -------------------------------------------------------------------------
// 5. Comunicaciones
// -------------------------------------------------------------------------
console.log("\n⟶ Insertando comunicaciones…");

const bookingByGuestEmail = Object.fromEntries(
  bookings
    .filter((b) => b.status !== "cancelled")
    .map((b) => {
      const guest = guests.find((g) => g.id === b.guest_id);
      return [guest?.email, b];
    }),
);

const commsInput = [
  {
    guest_id: gid("lmendez@example.com"),
    booking_id: bookingByGuestEmail["lmendez@example.com"]?.id ?? null,
    channel: "whatsapp",
    direction: "outbound",
    content:
      "Hola Luis! Recibimos tu solicitud para el aniversario. Confirmamos cena privada y decoración floral. Pasamos link de pago.",
  },
  {
    guest_id: gid("lmendez@example.com"),
    booking_id: bookingByGuestEmail["lmendez@example.com"]?.id ?? null,
    channel: "whatsapp",
    direction: "inbound",
    content: "Perfecto, pagamos ya. Muchas gracias!",
  },
  {
    guest_id: gid("dianam@example.com"),
    booking_id: bookingByGuestEmail["dianam@example.com"]?.id ?? null,
    channel: "email",
    direction: "outbound",
    content:
      "Diana, todo listo para tu aniversario. Confirmamos las rosas blancas y la cena en la terraza el día 2.",
  },
  {
    guest_id: gid("emma.j@example.com"),
    booking_id: bookingByGuestEmail["emma.j@example.com"]?.id ?? null,
    channel: "email",
    direction: "inbound",
    content:
      "Hi, I need to confirm the dietary restrictions for the 7-day silent retreat. Fully vegan please, no dairy.",
  },
  {
    guest_id: gid("cgutierrez@example.com"),
    booking_id: bookingByGuestEmail["cgutierrez@example.com"]?.id ?? null,
    channel: "phone",
    direction: "outbound",
    content:
      "Llamada de pre-check-in. Confirmamos horario de llegada (3pm) y que no hay WiFi en la habitación.",
  },
  {
    guest_id: gid("laurasanchez@example.com"),
    booking_id: bookingByGuestEmail["laurasanchez@example.com"]?.id ?? null,
    channel: "whatsapp",
    direction: "inbound",
    content:
      "Hola! Quiero organizar un cumpleaños sorpresa, necesito saber si pueden traer una torta.",
  },
  {
    guest_id: gid("ana.restrepo@example.com"),
    booking_id: null,
    channel: "note",
    direction: "outbound",
    content:
      "Cliente recurrente. Siempre viene con el mismo grupo de yoga. Tratamiento preferencial.",
  },
];

await must(
  `${commsInput.length} comunicaciones insertadas`,
  sb.from("communications").insert(commsInput),
);

// -------------------------------------------------------------------------
// 6. Sync log
// -------------------------------------------------------------------------
console.log("\n⟶ Insertando log de sync…");

await must(
  "Sync log insertado",
  sb.from("sync_log").insert([
    {
      source: DEMO_SYNC_SOURCE,
      status: "success",
      events_imported: 2,
      errors: null,
    },
  ]),
);

// -------------------------------------------------------------------------
// 7. PQRSF (requiere migración 0003)
// -------------------------------------------------------------------------
console.log("\n⟶ Insertando PQRSF demo…");

let pqrsfCount = 0;
let reviewsCount = 0;

const complaintsProbe = await sb
  .from("complaints")
  .select("id")
  .limit(1);

if (complaintsProbe.error && complaintsProbe.error.code === "42P01") {
  console.log(
    "⚠ Tabla complaints no existe. Corré migración 0003 en Supabase Dashboard → SQL Editor.\n" +
      "   Archivo: supabase/migrations/0003_pqrsf_reviews.sql\n" +
      "   Saltando PQRSF + Reviews.",
  );
} else {
  // Limpiar demo previa
  await sb
    .from("complaints")
    .delete()
    .like("tracking_code", "PQRSF-2099-%");

  const DEMO_YEAR = 2099; // prefijo especial para no colisionar con producción
  function demoCode(n) {
    return `PQRSF-${DEMO_YEAR}-${String(n).padStart(4, "0")}`;
  }
  function daysFromTodayISO(n) {
    return new Date(Date.now() + n * 86400000).toISOString();
  }

  const complaintsDemo = [
    {
      tracking_code: demoCode(1),
      type: "reclamo",
      subject: "La habitación tenía humedad en el techo",
      description:
        "Durante nuestra estadía de hace 3 días notamos una mancha de humedad creciente en la esquina del techo. Reportamos al staff pero esperábamos que nos cambiaran de habitación, lo cual no ocurrió.",
      guest_name: "Ana Restrepo",
      guest_email: "ana.restrepo@example.com",
      guest_phone: "+573001112233",
      status: "resuelto",
      priority: "alta",
      sla_due_at: daysFromTodayISO(-20),
      resolved_at: daysFromTodayISO(-18),
      resolution_notes:
        "Ana, confirmamos el daño estructural y ya está siendo reparado. Te ofrecemos una noche gratuita en tu próxima visita como compensación. Gracias por alertarnos.",
      created_at: daysFromTodayISO(-22),
    },
    {
      tracking_code: demoCode(2),
      type: "sugerencia",
      subject: "Más opciones veganas en el menú",
      description:
        "Amé la comida pero como vegana tenía opciones limitadas. Sería hermoso tener 1-2 platos veganos fijos en cada tiempo, no solo sustituciones.",
      guest_name: "Emma Johansson",
      guest_email: "emma.j@example.com",
      guest_phone: "+46701234567",
      status: "en_proceso",
      priority: "media",
      sla_due_at: daysFromTodayISO(8),
      created_at: daysFromTodayISO(-2),
    },
    {
      tracking_code: demoCode(3),
      type: "queja",
      subject: "WiFi muy lento en áreas comunes",
      description:
        "Entiendo la filosofía de desconexión pero necesité hacer una llamada urgente y el WiFi no soportó videollamada. Se cortó dos veces.",
      guest_name: "Carlos Gutiérrez",
      guest_email: "cgutierrez@example.com",
      guest_phone: "+573134567890",
      status: "nuevo",
      priority: "media",
      sla_due_at: daysFromTodayISO(-2), // vencida
      created_at: daysFromTodayISO(-12),
    },
    {
      tracking_code: demoCode(4),
      type: "felicitacion",
      subject: "¡Experiencia transformadora!",
      description:
        "Quería escribirles solo para agradecer. El personal, la comida, el silencio, todo fue absolutamente mágico. Vuelvo en 3 meses.",
      guest_name: "Luis Méndez",
      guest_email: "lmendez@example.com",
      guest_phone: "+525544556677",
      status: "cerrado",
      priority: "baja",
      sla_due_at: daysFromTodayISO(10),
      resolved_at: daysFromTodayISO(-80),
      resolution_notes:
        "¡Gracias Luis! Ya dejamos registrado tu comentario en nuestro libro de agradecimientos del equipo. Te esperamos.",
      created_at: daysFromTodayISO(-82),
    },
    {
      tracking_code: demoCode(5),
      type: "peticion",
      subject: "Solicito factura electrónica",
      description:
        "Hola, para mi empresa necesito factura electrónica con NIT 900123456-7 de la estadía del mes pasado. Agradezco poder recibirla esta semana.",
      guest_name: "Michael Chen",
      guest_email: "mchen@example.com",
      guest_phone: "+14155551234",
      status: "nuevo",
      priority: "urgente",
      sla_due_at: daysFromTodayISO(4),
      created_at: daysFromTodayISO(-1),
    },
  ];

  const { data: cInserted, error: cErr } = await sb
    .from("complaints")
    .insert(complaintsDemo)
    .select("id");
  if (cErr) {
    console.error("✗ Error PQRSF:", cErr.message);
  } else {
    pqrsfCount = cInserted.length;
    console.log(`✓ ${pqrsfCount} PQRSF insertadas`);
    // Event de creación para cada una
    await sb.from("complaint_events").insert(
      cInserted.map((c, i) => ({
        complaint_id: c.id,
        event_type: "created",
        to_value: "nuevo",
        note: `Radicado por ${complaintsDemo[i].guest_name}`,
      })),
    );
  }

  // -----------------------------------------------------------------------
  // 8. Reviews
  // -----------------------------------------------------------------------
  console.log("\n⟶ Insertando reviews demo…");

  // Limpiar demo previas (marcadas con display_name terminando en "[demo]")
  await sb.from("reviews").delete().like("display_name", "%[demo]");

  // Asociar algunos reviews a bookings existentes (los completed)
  const completedBookings = bookings.filter((b) => b.status === "completed");

  const reviewsDemo = [
    {
      booking_id: completedBookings[0]?.id ?? null,
      guest_id: completedBookings[0]?.guest_id ?? null,
      rating: 5,
      title: "Un refugio increíble",
      content:
        "Esenza superó todas mis expectativas. El silencio, los paisajes, la atención al detalle... volveré sin duda. Tip: pedí el paquete Armonía, vale la pena cada peso.",
      display_name: "Ana R. [demo]",
      status: "featured",
      source: "internal",
      language: "es",
      response:
        "¡Gracias Ana! Nos encanta escuchar que conectaste con el espacio. Te esperamos pronto.",
      response_at: daysFromTodayISO(-100),
      submitted_at: daysFromTodayISO(-105),
    },
    {
      booking_id: completedBookings[1]?.id ?? null,
      guest_id: completedBookings[1]?.guest_id ?? null,
      rating: 5,
      title: "Aniversario inolvidable",
      content:
        "Organizaron un aniversario de bodas absolutamente perfecto. La cena privada, las flores, la atención personalizada. Altamente recomendado para parejas.",
      display_name: "Luis M. [demo]",
      status: "featured",
      source: "internal",
      language: "es",
      submitted_at: daysFromTodayISO(-80),
    },
    {
      booking_id: completedBookings[2]?.id ?? null,
      guest_id: completedBookings[2]?.guest_id ?? null,
      rating: 4,
      title: "Muy buena experiencia",
      content:
        "La propiedad es hermosa y la atención excelente. Solo una observación menor: el check-in tardó más de lo esperado pero lo compensaron con un detalle muy lindo.",
      display_name: "Sofía V. [demo]",
      status: "approved",
      source: "internal",
      language: "es",
      submitted_at: daysFromTodayISO(-55),
    },
    {
      rating: 5,
      title: "Perfect retreat",
      content:
        "A truly magical place. The silence at night, the fresh mountain air, and the incredible vegan food made it an unforgettable experience.",
      display_name: "Emma J. [demo]",
      status: "approved",
      source: "internal",
      language: "en",
      submitted_at: daysFromTodayISO(-35),
    },
    {
      booking_id: completedBookings[3]?.id ?? null,
      guest_id: completedBookings[3]?.guest_id ?? null,
      rating: 3,
      title: "Bueno pero mejorable",
      content:
        "La propiedad es linda pero sentí que para el precio esperaba más variedad en el desayuno. La habitación estaba impecable y el entorno es espectacular.",
      display_name: "María Camila T. [demo]",
      status: "pending",
      source: "internal",
      language: "es",
      submitted_at: daysFromTodayISO(-3),
    },
    {
      rating: 2,
      title: "Ruido en la madrugada",
      content:
        "Hubo una fiesta en una propiedad cercana que no nos dejó dormir bien dos noches. El staff hizo lo posible pero el ruido era externo.",
      display_name: "Pedro J. [demo]",
      status: "pending",
      source: "internal",
      language: "es",
      submitted_at: daysFromTodayISO(-1),
    },
    {
      rating: 5,
      title: "Wonderful stay",
      content:
        "Everything was perfect. The pool at night, the yoga deck, the food, the staff — all five stars. Will definitely recommend.",
      display_name: "Michael C. [demo]",
      status: "approved",
      source: "google",
      language: "en",
      external_id: "google-demo-1",
      submitted_at: daysFromTodayISO(-15),
    },
    {
      rating: 4,
      title: "Recomendado",
      content:
        "Excelente escape de la ciudad. Precios justos para lo que ofrecen. El yoga matutino fue mi parte favorita.",
      display_name: "Andrés Q. [demo]",
      status: "approved",
      source: "google",
      language: "es",
      external_id: "google-demo-2",
      submitted_at: daysFromTodayISO(-8),
    },
  ].filter(
    // si no hay booking disponible quitamos la restricción unique sobre booking_id
    (r) => true,
  );

  const { data: rInserted, error: rErr } = await sb
    .from("reviews")
    .insert(reviewsDemo)
    .select("id");
  if (rErr) {
    console.error("✗ Error reviews:", rErr.message);
  } else {
    reviewsCount = rInserted.length;
    console.log(`✓ ${reviewsCount} reviews insertadas`);
  }
}

// -------------------------------------------------------------------------
// 9. Resumen
// -------------------------------------------------------------------------
console.log("\n✅ Seed completado\n");
console.log(`   Huéspedes: ${guests.length}`);
console.log(`   Reservas: ${bookings.length}`);
console.log(`   Bloqueos: ${blocksInput.length}`);
console.log(`   Comunicaciones: ${commsInput.length}`);
console.log(`   PQRSF: ${pqrsfCount}`);
console.log(`   Reviews: ${reviewsCount}`);
console.log("\nAbrí http://localhost:3000/admin para verlo.\n");
