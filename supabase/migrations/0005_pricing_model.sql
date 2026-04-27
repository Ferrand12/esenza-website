-- Esenza · 0005 · Nuevo modelo de pricing (por persona + mínimo de personas)
-- Correlo en Supabase Dashboard → SQL Editor → Run

-- Permitir 'escapada_basica' en el enum de paquetes (sin romper históricos con 'plenitud')
alter table public.bookings drop constraint if exists bookings_package_check;
alter table public.bookings
  add constraint bookings_package_check
  check (package in ('esencia', 'armonia', 'plenitud', 'escapada_basica'));

-- Semilla del nuevo shape de site_config.packages (upsert no-destructivo)
-- El consumer lee el jsonb completo; mantenemos compat con el legacy {esencia:N, armonia:N, plenitud:N}
-- si ya existe el key.
insert into public.site_config (key, value) values
  ('packages_v2', '{
    "escapada_basica": {
      "label": "Escapada Básica",
      "subtitle": "Descanso total",
      "base_price_per_person": 400000,
      "extra_night_per_person": 100000,
      "min_guests": 8,
      "base_nights": 1,
      "features": [
        "Finca completa",
        "Desayuno, almuerzo y cena campesina",
        "Recuerdos que duran toda la vida"
      ]
    },
    "esencia": {
      "label": "Esencia",
      "subtitle": "Experiencias · 2 días",
      "base_price_per_person": 480000,
      "extra_night_per_person": 200000,
      "min_guests": 8,
      "base_nights": 1,
      "features": [
        "Todo lo de Escapada Básica",
        "Snack de bienvenida el viernes",
        "Caminata guiada por senderos naturales",
        "Noche de fogata, música y estrellas"
      ]
    },
    "armonia": {
      "label": "Armonía",
      "subtitle": "Experiencias · 2 días",
      "base_price_per_person": 500000,
      "extra_night_per_person": 200000,
      "min_guests": 8,
      "base_nights": 1,
      "features": [
        "Todo lo de Esencia",
        "Clase de Yoga privada (mínimo 4 personas)"
      ]
    }
  }')
on conflict (key) do nothing;
