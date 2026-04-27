-- Esenza · seed de demostración
-- Crea 3 huéspedes y 4 reservas variadas para ver el admin con datos.
-- Aplicar con: psql <connection-string> -f supabase/seed.sql
-- O desde Supabase Dashboard → SQL Editor → New query → pegar y Run.

-- Limpiar seeds previos (idempotente)
delete from public.communications where guest_id in (
  select id from public.guests where email in ('ana@example.com','luis@example.com','sofia@example.com')
);
delete from public.bookings where guest_id in (
  select id from public.guests where email in ('ana@example.com','luis@example.com','sofia@example.com')
);
delete from public.guests where email in ('ana@example.com','luis@example.com','sofia@example.com');
delete from public.calendar_blocks where reason like 'Demo%';

-- Huéspedes
with new_guests as (
  insert into public.guests (full_name, email, phone, country, tags) values
    ('Ana Restrepo', 'ana@example.com', '+573001112233', 'Colombia', '{"yoga","retiro"}'),
    ('Luis Méndez', 'luis@example.com', '+521554445566', 'México', '{"vip","aniversario"}'),
    ('Sofía Vargas', 'sofia@example.com', '+573017778899', 'Colombia', '{}')
  returning id, email
)
-- Reservas (precios calculados manualmente: paquete × noches)
insert into public.bookings (guest_id, check_in, check_out, num_guests, package, total_price, status, source, special_requests)
select
  g.id,
  b.check_in::date,
  b.check_out::date,
  b.num_guests,
  b.package,
  b.total_price,
  b.status,
  b.source,
  b.special_requests
from new_guests g
join (values
  ('ana@example.com',   (current_date + 14)::text, (current_date + 17)::text, 2, 'armonia',  1950000, 'confirmed', 'web',      'Vegetariana, alergia a frutos secos'),
  ('ana@example.com',   (current_date - 60)::text, (current_date - 57)::text, 2, 'esencia',  1050000, 'completed', 'web',      null),
  ('luis@example.com',  (current_date + 30)::text, (current_date + 35)::text, 4, 'plenitud', 4500000, 'pending',   'whatsapp', 'Aniversario de bodas — quieren cena privada'),
  ('sofia@example.com', (current_date + 7)::text,  (current_date + 9)::text,  1, 'esencia',  700000,  'pending',   'web',      null)
) as b(email, check_in, check_out, num_guests, package, total_price, status, source, special_requests)
  on b.email = g.email;

-- Bloqueo manual de demo
insert into public.calendar_blocks (start_date, end_date, reason, source) values
  ((current_date + 45)::date, (current_date + 48)::date, 'Demo · mantenimiento', 'manual');

-- Comunicación de demo
insert into public.communications (guest_id, booking_id, channel, direction, content)
select
  g.id,
  b.id,
  'whatsapp',
  'outbound',
  'Hola Luis! Recibimos tu solicitud para el aniversario. Te confirmo cena privada y decoración floral. Pasamos a confirmar pago.'
from public.guests g
join public.bookings b on b.guest_id = g.id
where g.email = 'luis@example.com'
limit 1;
