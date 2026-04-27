-- Esenza · 0003 · PQRSF + Reviews
-- Correlo en Supabase Dashboard → SQL Editor → Run
-- Idempotente: usá IF NOT EXISTS o dropeá si ya probaste.

-- ============================================================================
-- COMPLAINTS (PQRSF = Petición · Queja · Reclamo · Sugerencia · Felicitación)
-- ============================================================================
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  tracking_code text unique not null,
  type text not null check (type in ('peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion')),
  subject text not null,
  description text not null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  booking_id uuid references public.bookings(id) on delete set null,
  status text not null default 'nuevo' check (status in ('nuevo', 'en_proceso', 'resuelto', 'cerrado')),
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta', 'urgente')),
  assigned_to uuid references public.profiles(id) on delete set null,
  channel text not null default 'web' check (channel in ('web', 'email', 'whatsapp', 'presencial')),
  sla_due_at timestamptz not null,
  resolved_at timestamptz,
  resolution_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_status_idx on public.complaints(status);
create index if not exists complaints_sla_due_idx on public.complaints(sla_due_at);
create index if not exists complaints_type_idx on public.complaints(type);
create index if not exists complaints_guest_email_idx on public.complaints(guest_email);
create index if not exists complaints_tracking_code_idx on public.complaints(tracking_code);

drop trigger if exists complaints_updated_at on public.complaints;
create trigger complaints_updated_at before update on public.complaints
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- COMPLAINT EVENTS (audit trail)
-- ============================================================================
create table if not exists public.complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  event_type text not null,
  from_value text,
  to_value text,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists complaint_events_complaint_idx on public.complaint_events(complaint_id, created_at desc);

-- ============================================================================
-- REVIEWS
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references public.guests(id) on delete set null,
  booking_id uuid unique references public.bookings(id) on delete set null,
  source text not null default 'internal' check (source in ('internal', 'google', 'airbnb', 'tripadvisor', 'booking_com')),
  rating int not null check (rating between 1 and 5),
  title text,
  content text not null,
  language text not null default 'es' check (language in ('es', 'en')),
  response text,
  response_at timestamptz,
  response_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'featured')),
  token text unique,
  token_expires_at timestamptz,
  external_id text,
  external_url text,
  display_name text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_rating_idx on public.reviews(rating);
create index if not exists reviews_source_idx on public.reviews(source);
create index if not exists reviews_token_idx on public.reviews(token);

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- DEFAULT CONFIG: SLA por tipo (días hábiles), pqrsf admin email, etc.
-- ============================================================================
insert into public.site_config (key, value) values
  ('pqrsf_sla_business_days', '{"peticion": 15, "queja": 10, "reclamo": 15, "sugerencia": 15, "felicitacion": 15}'),
  ('pqrsf_admin_email', '""'),
  ('reviews_auto_approve', 'false')
on conflict (key) do nothing;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.complaints enable row level security;
alter table public.complaint_events enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "complaints_admin_all" on public.complaints;
create policy "complaints_admin_all" on public.complaints
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "complaint_events_admin_all" on public.complaint_events;
create policy "complaint_events_admin_all" on public.complaint_events
  for all using (public.is_admin()) with check (public.is_admin());

-- Reviews: public read solo aprobadas/destacadas (para Testimonials + /resenas)
drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved" on public.reviews
  for select using (status in ('approved', 'featured'));

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());
