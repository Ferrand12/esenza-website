import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "reservas@esenza.co";

export const resend = apiKey ? new Resend(apiKey) : null;

export interface BookingEmailData {
  guestName: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  packageName: string;
  totalPrice: number;
  specialRequests?: string;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-CO")} COP`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function sendBookingConfirmationToGuest(
  to: string,
  data: BookingEmailData,
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping guest email");
    return;
  }

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: "Hemos recibido tu reserva · Esenza",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h1 style="font-family: 'Georgia', serif; font-weight: 300; color: #002814; font-size: 36px; margin: 0;">Esenza</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; color: #6f5d16; font-size: 11px; margin-top: 4px;">Natural Wellness Stay</p>

        <h2 style="margin-top: 40px; font-weight: 400; color: #002814;">Hola ${data.guestName},</h2>
        <p style="line-height: 1.7;">Hemos recibido tu solicitud de reserva. En las próximas horas un miembro del equipo te contactará por WhatsApp para confirmar los detalles y coordinar tu llegada.</p>

        <div style="background: #fdf9f3; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <h3 style="margin: 0 0 16px; font-weight: 500; color: #002814;">Detalles de tu reserva</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #666;">Check-in</td><td style="text-align: right; font-weight: 500;">${formatDate(data.checkIn)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Check-out</td><td style="text-align: right; font-weight: 500;">${formatDate(data.checkOut)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Huéspedes</td><td style="text-align: right; font-weight: 500;">${data.numGuests}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Paquete</td><td style="text-align: right; font-weight: 500; text-transform: capitalize;">${data.packageName}</td></tr>
            <tr><td style="padding: 12px 0 6px; color: #666; border-top: 1px solid #e5e5e5;">Total</td><td style="padding: 12px 0 6px; text-align: right; font-weight: 600; color: #002814; border-top: 1px solid #e5e5e5;">${formatPrice(data.totalPrice)}</td></tr>
          </table>
        </div>

        ${data.specialRequests ? `<p style="font-size: 14px; color: #666;"><strong>Tus comentarios:</strong><br>${data.specialRequests}</p>` : ""}

        <p style="line-height: 1.7; margin-top: 32px;">Si tienes cualquier pregunta mientras tanto, no dudes en responder a este correo.</p>

        <p style="margin-top: 40px; color: #6f5d16; font-style: italic;">Con calma,<br>El equipo de Esenza</p>
      </div>
    `,
  });
}

export async function sendBookingNotificationToAdmin(
  to: string,
  data: BookingEmailData & {
    guestEmail: string;
    guestPhone: string;
    bookingId: string;
  },
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping admin email");
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `Nueva reserva: ${data.guestName} · ${data.checkIn}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #002814; margin: 0 0 24px;">🌿 Nueva reserva recibida</h2>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Nombre</td><td style="font-weight: 500;">${data.guestName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td><a href="mailto:${data.guestEmail}">${data.guestEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Teléfono</td><td><a href="https://wa.me/${data.guestPhone.replace(/\D/g, "")}">${data.guestPhone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Check-in</td><td>${formatDate(data.checkIn)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Check-out</td><td>${formatDate(data.checkOut)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Huéspedes</td><td>${data.numGuests}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Paquete</td><td style="text-transform: capitalize;">${data.packageName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Total</td><td style="font-weight: 600;">${formatPrice(data.totalPrice)}</td></tr>
        </table>

        ${data.specialRequests ? `<p style="margin-top: 20px; font-size: 14px;"><strong>Comentarios:</strong><br>${data.specialRequests}</p>` : ""}

        <a href="${siteUrl}/admin/reservas/${data.bookingId}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #002814; color: white; text-decoration: none; border-radius: 24px; font-size: 14px;">Ver en admin</a>
      </div>
    `,
  });
}

export async function sendPreCheckinReminder(
  to: string,
  data: BookingEmailData & { whatsapp: string; location: string },
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping pre-checkin email");
    return;
  }

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: "Tu estadía en Esenza comienza en 2 días",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h1 style="font-family: 'Georgia', serif; font-weight: 300; color: #002814; font-size: 36px; margin: 0;">Esenza</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; color: #6f5d16; font-size: 11px; margin-top: 4px;">Natural Wellness Stay</p>

        <h2 style="margin-top: 40px; font-weight: 400; color: #002814;">Hola ${data.guestName},</h2>
        <p style="line-height: 1.7;">Faltan solo <strong>dos días</strong> para tu llegada. Te escribimos para recordarte algunos detalles y prepararnos juntos para tu estadía.</p>

        <div style="background: #fdf9f3; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <h3 style="margin: 0 0 16px; font-weight: 500; color: #002814;">Tu reserva</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #666;">Check-in</td><td style="text-align: right; font-weight: 500;">${formatDate(data.checkIn)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Check-out</td><td style="text-align: right; font-weight: 500;">${formatDate(data.checkOut)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Huéspedes</td><td style="text-align: right; font-weight: 500;">${data.numGuests}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Paquete</td><td style="text-align: right; font-weight: 500; text-transform: capitalize;">${data.packageName}</td></tr>
          </table>
        </div>

        <h3 style="color: #002814; font-weight: 500;">Antes de llegar</h3>
        <ul style="line-height: 1.8; color: #333;">
          <li>El check-in es a partir de las <strong>3:00 p.m.</strong></li>
          <li>Ubicación: ${data.location}</li>
          <li>Traé ropa cómoda, impermeable liviano y zapatos para caminata. Las noches son frescas.</li>
          <li>La señal de celular es limitada — es parte de la desconexión. WiFi disponible en áreas comunes.</li>
        </ul>

        <p style="line-height: 1.7; margin-top: 24px;">Si tenés preguntas o necesitás coordinar la llegada, escribinos por WhatsApp:</p>
        <a href="https://wa.me/${data.whatsapp.replace(/\D/g, "")}" style="display: inline-block; padding: 12px 24px; background: #25D366; color: white; text-decoration: none; border-radius: 24px; font-size: 14px; margin-top: 8px;">Chatear por WhatsApp</a>

        <p style="margin-top: 40px; color: #6f5d16; font-style: italic;">Te esperamos con calma,<br>El equipo de Esenza</p>
      </div>
    `,
  });
}

export async function sendPostStayFollowup(
  to: string,
  data: Pick<BookingEmailData, "guestName"> & {
    whatsapp: string;
    reviewUrl?: string;
  },
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping post-stay email");
    return;
  }

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: "Gracias por tu estadía · Esenza",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h1 style="font-family: 'Georgia', serif; font-weight: 300; color: #002814; font-size: 36px; margin: 0;">Esenza</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; color: #6f5d16; font-size: 11px; margin-top: 4px;">Natural Wellness Stay</p>

        <h2 style="margin-top: 40px; font-weight: 400; color: #002814;">Hola ${data.guestName},</h2>
        <p style="line-height: 1.7;">Gracias por elegirnos como tu refugio estos días. Esperamos que te lleves momentos de calma, reconexión y descanso verdadero.</p>

        <div style="background: #fdf9f3; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <h3 style="margin: 0 0 12px; font-weight: 500; color: #002814;">¿Cómo fue tu experiencia?</h3>
          <p style="line-height: 1.7; font-size: 14px; color: #555; margin: 0 0 16px;">Tu opinión nos ayuda a mejorar y a que más personas encuentren su espacio de pausa. Si podés dedicarnos dos minutos para dejarnos una reseña, te lo agradecemos de corazón.</p>
          <a href="${data.reviewUrl ?? `https://wa.me/${data.whatsapp.replace(/\D/g, "")}?text=Quiero%20dejar%20una%20rese%C3%B1a`}" style="display: inline-block; padding: 12px 24px; background: #002814; color: white; text-decoration: none; border-radius: 24px; font-size: 14px;">Dejar reseña</a>
        </div>

        <p style="line-height: 1.7;">Quedamos a tu disposición para tu próxima estadía. Como huésped recurrente, tenemos condiciones especiales reservadas para vos.</p>

        <p style="margin-top: 40px; color: #6f5d16; font-style: italic;">Con gratitud,<br>El equipo de Esenza</p>
      </div>
    `,
  });
}

// ============================================================================
// PQRSF
// ============================================================================

const COMPLAINT_TYPE_ES: Record<string, string> = {
  peticion: "petición",
  queja: "queja",
  reclamo: "reclamo",
  sugerencia: "sugerencia",
  felicitacion: "felicitación",
};

export async function sendComplaintAcknowledgment(
  to: string,
  data: {
    guestName: string;
    trackingCode: string;
    type: string;
    subject: string;
    slaDueAt: string;
  },
) {
  if (!resend) {
    console.warn("[email] Resend not configured, skipping complaint ack");
    return;
  }
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const typeLabel = COMPLAINT_TYPE_ES[data.type] || data.type;
  const dueDate = new Date(data.slaDueAt).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `Recibimos tu ${typeLabel} · ${data.trackingCode}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h1 style="font-family: 'Georgia', serif; font-weight: 300; color: #002814; font-size: 36px; margin: 0;">Esenza</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; color: #6f5d16; font-size: 11px; margin-top: 4px;">Natural Wellness Stay</p>

        <h2 style="margin-top: 40px; font-weight: 400; color: #002814;">Hola ${data.guestName},</h2>
        <p style="line-height: 1.7;">Recibimos tu <strong>${typeLabel}</strong> y queremos agradecerte el tiempo de escribirnos. La vamos a revisar con atención.</p>

        <div style="background: #fdf9f3; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Código de seguimiento</p>
          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #002814; font-family: monospace;">${data.trackingCode}</p>
          <p style="margin: 16px 0 0; font-size: 13px; color: #666;">Asunto: ${data.subject}</p>
        </div>

        <p style="line-height: 1.7;">De acuerdo a nuestra política, te daremos respuesta a más tardar el <strong>${dueDate}</strong>. Te enviaremos un email cuando cambie el estado de tu solicitud.</p>

        <p style="line-height: 1.7; margin-top: 24px;">Podés consultar el estado en cualquier momento acá:</p>
        <a href="${siteUrl}/pqrsf/consultar/${data.trackingCode}" style="display: inline-block; padding: 12px 24px; background: #002814; color: white; text-decoration: none; border-radius: 24px; font-size: 14px; margin-top: 8px;">Consultar estado</a>

        <p style="margin-top: 40px; color: #6f5d16; font-style: italic;">Con atención,<br>El equipo de Esenza</p>
      </div>
    `,
  });
}

export async function sendComplaintAdminNotification(
  to: string,
  data: {
    guestName: string;
    guestEmail: string;
    guestPhone: string | null;
    trackingCode: string;
    type: string;
    subject: string;
    description: string;
    complaintId: string;
  },
) {
  if (!resend) return;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const typeLabel = COMPLAINT_TYPE_ES[data.type] || data.type;
  const typeEmoji =
    data.type === "felicitacion"
      ? "🌟"
      : data.type === "sugerencia"
        ? "💡"
        : data.type === "reclamo"
          ? "⚠️"
          : "📝";

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `${typeEmoji} Nueva ${typeLabel} · ${data.trackingCode}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #002814; margin: 0 0 24px;">${typeEmoji} Nueva ${typeLabel}</h2>
        <p style="font-family: monospace; color: #666; font-size: 13px;">${data.trackingCode}</p>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px 0; color: #666;">De</td><td style="font-weight: 500;">${data.guestName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td><a href="mailto:${data.guestEmail}">${data.guestEmail}</a></td></tr>
          ${data.guestPhone ? `<tr><td style="padding: 8px 0; color: #666;">Teléfono</td><td>${data.guestPhone}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #666;">Asunto</td><td style="font-weight: 500;">${data.subject}</td></tr>
        </table>

        <div style="margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 8px; border-left: 3px solid #002814;">
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${data.description}</p>
        </div>

        <a href="${siteUrl}/admin/pqrsf/${data.complaintId}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #002814; color: white; text-decoration: none; border-radius: 24px; font-size: 14px;">Gestionar en admin</a>
      </div>
    `,
  });
}

export async function sendComplaintResolution(
  to: string,
  data: {
    guestName: string;
    trackingCode: string;
    type: string;
    subject: string;
    resolutionNotes: string;
  },
) {
  if (!resend) return;
  const typeLabel = COMPLAINT_TYPE_ES[data.type] || data.type;

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `Resolvimos tu ${typeLabel} · ${data.trackingCode}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h1 style="font-family: 'Georgia', serif; font-weight: 300; color: #002814; font-size: 36px; margin: 0;">Esenza</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; color: #6f5d16; font-size: 11px; margin-top: 4px;">Natural Wellness Stay</p>

        <h2 style="margin-top: 40px; font-weight: 400; color: #002814;">Hola ${data.guestName},</h2>
        <p style="line-height: 1.7;">Tenemos novedades sobre tu ${typeLabel} <strong>${data.trackingCode}</strong> (${data.subject}).</p>

        <div style="background: #f0f9f2; border-left: 4px solid #2e7d4e; border-radius: 4px; padding: 20px; margin: 32px 0;">
          <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #2e7d4e; font-weight: 600;">Respuesta</p>
          <p style="margin: 0; line-height: 1.7; white-space: pre-wrap;">${data.resolutionNotes}</p>
        </div>

        <p style="line-height: 1.7; margin-top: 24px;">Si tu situación no quedó resuelta o tenés algo más que aportar, respondé este correo y lo retomamos.</p>

        <p style="margin-top: 40px; color: #6f5d16; font-style: italic;">Gracias por ayudarnos a mejorar,<br>El equipo de Esenza</p>
      </div>
    `,
  });
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function sendSlaBreachAlert(
  to: string,
  data: {
    complaints: {
      trackingCode: string;
      type: string;
      subject: string;
      guestName: string;
      slaDueAt: string;
      priority: string;
      url: string;
    }[];
  },
) {
  if (!resend) return;
  if (data.complaints.length === 0) return;

  const rows = data.complaints
    .map((c) => {
      const overdue = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(c.slaDueAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 12px;"><a href="${c.url}" style="color: #002814;">${c.trackingCode}</a></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; text-transform: capitalize;">${c.type}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">${c.subject}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">${c.guestName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; color: #b91c1c; font-weight: 600;">${overdue} ${overdue === 1 ? "día" : "días"}</td>
        </tr>
      `;
    })
    .join("");

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `⚠️ ${data.complaints.length} PQRSF fuera de plazo`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #b91c1c; margin: 0 0 8px;">⚠️ PQRSF fuera de plazo</h2>
        <p style="color: #666; margin: 0 0 24px; font-size: 14px;">Estas solicitudes incumplen el SLA legal. Resolverlas hoy para evitar reclamos ante la SIC.</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #fafafa; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">
              <th style="padding: 10px;">Código</th>
              <th style="padding: 10px;">Tipo</th>
              <th style="padding: 10px;">Asunto</th>
              <th style="padding: 10px;">Remitente</th>
              <th style="padding: 10px;">Atraso</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `,
  });
}

export async function sendRetreatRegistrationAck(
  to: string,
  data: {
    guestName: string;
    language: "es" | "en";
    registrationId: string;
    isAdminCopy?: boolean;
  },
) {
  if (!resend) return;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (data.isAdminCopy) {
    return resend.emails.send({
      from: `Esenza <${fromEmail}>`,
      to,
      subject: `🧘 Nueva inscripción a retiro · ${data.guestName}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#002814;margin:0 0 16px">🧘 Nueva inscripción a retiro</h2>
          <p style="color:#333;line-height:1.6">${data.guestName} acaba de completar el formulario de inscripción.</p>
          <a href="${siteUrl}/admin/retiros/${data.registrationId}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#002814;color:white;text-decoration:none;border-radius:24px;font-size:14px">Ver en admin</a>
        </div>
      `,
    });
  }

  const es = data.language === "es";
  const subject = es
    ? "Hemos recibido tu inscripción · Esenza"
    : "We received your registration · Esenza";

  const body = es
    ? `
        <h2 style="font-weight:400;color:#002814;margin-top:32px">Hola ${data.guestName},</h2>
        <p style="line-height:1.7">Recibimos tu formulario de inscripción al retiro. En los próximos días te contactaremos por email o WhatsApp para coordinar los detalles finales y el pago.</p>
        <p style="line-height:1.7">Mientras tanto, si tenés preguntas, podés responder este correo.</p>
        <p style="margin-top:40px;color:#6f5d16;font-style:italic">Con calma,<br>El equipo de Esenza</p>
      `
    : `
        <h2 style="font-weight:400;color:#002814;margin-top:32px">Hi ${data.guestName},</h2>
        <p style="line-height:1.7">We received your retreat registration form. In the coming days we will contact you by email or WhatsApp to coordinate the final details and payment.</p>
        <p style="line-height:1.7">In the meantime, if you have questions you can reply to this email.</p>
        <p style="margin-top:40px;color:#6f5d16;font-style:italic">With calm,<br>The Esenza team</p>
      `;

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a">
        <h1 style="font-family:Georgia,serif;font-weight:300;color:#002814;font-size:36px;margin:0">Esenza</h1>
        <p style="text-transform:uppercase;letter-spacing:3px;color:#6f5d16;font-size:11px;margin-top:4px">Natural Wellness Stay</p>
        ${body}
      </div>
    `,
  });
}

export async function sendMonthlyPqrsfReport(
  to: string,
  data: {
    monthLabel: string;
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byArea: Record<string, number>;
    slaBreached: number;
    slaCompliance: number;
    avgResolutionDays: number | null;
  },
) {
  if (!resend) return;

  function renderRow(label: string, count: number, total: number): string {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `<tr><td style="padding:6px 0;color:#333;text-transform:capitalize">${label}</td><td style="padding:6px 0;text-align:right;font-weight:500">${count} <span style="color:#999;font-size:11px">(${pct}%)</span></td></tr>`;
  }

  const typeRows = Object.entries(data.byType)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => renderRow(k, v, data.total))
    .join("");
  const statusRows = Object.entries(data.byStatus)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => renderRow(k.replace("_", " "), v, data.total))
    .join("");
  const areaRows = Object.entries(data.byArea)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, v]) => renderRow(k, v, data.total))
    .join("");

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `📊 Reporte PQRSF · ${data.monthLabel}`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
        <h1 style="font-family:Georgia,serif;font-weight:300;color:#002814;font-size:28px;margin:0">Reporte PQRSF</h1>
        <p style="text-transform:uppercase;letter-spacing:3px;color:#6f5d16;font-size:11px;margin-top:4px">${data.monthLabel}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px">
          <div style="background:#fdf9f3;border-radius:12px;padding:16px">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;margin:0">Total recibidas</p>
            <p style="font-size:36px;color:#002814;margin:4px 0 0;font-family:Georgia,serif;font-weight:300">${data.total}</p>
          </div>
          <div style="background:${data.slaCompliance >= 90 ? "#f0f9f2" : data.slaCompliance >= 70 ? "#fff8e1" : "#ffecec"};border-radius:12px;padding:16px">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;margin:0">Cumplimiento SLA</p>
            <p style="font-size:36px;color:${data.slaCompliance >= 90 ? "#2e7d4e" : data.slaCompliance >= 70 ? "#b57700" : "#b91c1c"};margin:4px 0 0;font-family:Georgia,serif;font-weight:300">${data.slaCompliance.toFixed(0)}%</p>
            <p style="font-size:11px;color:#999;margin:2px 0 0">${data.slaBreached} fuera de plazo</p>
          </div>
        </div>

        ${
          data.avgResolutionDays !== null
            ? `
          <div style="margin-top:16px;background:#fafafa;border-radius:12px;padding:16px">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;margin:0">Tiempo promedio de resolución</p>
            <p style="font-size:24px;color:#002814;margin:4px 0 0;font-family:Georgia,serif;font-weight:300">${data.avgResolutionDays.toFixed(1)} días</p>
          </div>`
            : ""
        }

        <h2 style="color:#002814;font-size:16px;margin-top:32px;font-weight:500">Por tipo</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">${typeRows || "<tr><td>Sin datos</td></tr>"}</table>

        <h2 style="color:#002814;font-size:16px;margin-top:24px;font-weight:500">Por estado</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">${statusRows || "<tr><td>Sin datos</td></tr>"}</table>

        ${
          areaRows
            ? `
          <h2 style="color:#002814;font-size:16px;margin-top:24px;font-weight:500">Por área temática (detectado por AI)</h2>
          <table style="width:100%;font-size:14px;border-collapse:collapse">${areaRows}</table>`
            : ""
        }

        <p style="margin-top:32px;color:#666;font-size:12px">Este reporte se genera automáticamente el primer día de cada mes. Podés ver el detalle en el panel de administración.</p>
      </div>
    `,
  });
}

export async function sendReviewAdminNotification(
  to: string,
  data: {
    guestName: string;
    rating: number;
    title: string | null;
    content: string;
    reviewId: string;
  },
) {
  if (!resend) return;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const isLow = data.rating <= 3;

  return resend.emails.send({
    from: `Esenza <${fromEmail}>`,
    to,
    subject: `${isLow ? "⚠️ Review baja" : "⭐ Nuevo review"} · ${data.rating}/5 de ${data.guestName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: ${isLow ? "#b91c1c" : "#002814"}; margin: 0 0 16px;">
          ${isLow ? "⚠️ Review con rating bajo" : "⭐ Nuevo review"}
        </h2>

        <p style="font-size: 24px; margin: 0; color: #6f5d16; letter-spacing: 4px;">${stars}</p>
        <p style="margin: 8px 0 24px; color: #666;">${data.rating}/5 · ${data.guestName}</p>

        ${data.title ? `<h3 style="color: #002814; margin: 16px 0 8px; font-weight: 500;">${data.title}</h3>` : ""}

        <div style="padding: 16px; background: #fafafa; border-radius: 8px; border-left: 3px solid ${isLow ? "#b91c1c" : "#002814"};">
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${data.content}</p>
        </div>

        ${isLow ? `<p style="margin-top: 20px; color: #b91c1c; font-size: 13px;"><strong>Importante:</strong> considera responder rápido para mitigar el impacto.</p>` : ""}

        <a href="${siteUrl}/admin/reviews" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #002814; color: white; text-decoration: none; border-radius: 24px; font-size: 14px;">Moderar en admin</a>
      </div>
    `,
  });
}
