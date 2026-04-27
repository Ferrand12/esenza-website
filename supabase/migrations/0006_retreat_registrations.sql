-- Esenza · 0006 · Retreat registrations (inscripciones a retiros)
-- Correlo en Supabase Dashboard → SQL Editor → Run

create table if not exists public.retreat_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  motivation text,
  traveling_from_out_of_town boolean not null default false,
  arrival_details text,
  dietary_restrictions text,
  injuries_notes text,
  ground_transport text not null default 'unknown' check (ground_transport in ('yes', 'no', 'unknown')),
  emergency_contact_name text,
  emergency_contact_phone text,
  additional_notes text,
  waiver_accepted boolean not null default false,
  signature text,
  language text not null default 'es' check (language in ('es', 'en')),
  retreat_type text,
  status text not null default 'nuevo' check (status in ('nuevo', 'confirmada', 'cancelada')),
  guest_id uuid references public.guests(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists retreat_registrations_email_idx
  on public.retreat_registrations(email);
create index if not exists retreat_registrations_status_idx
  on public.retreat_registrations(status);
create index if not exists retreat_registrations_created_at_idx
  on public.retreat_registrations(created_at desc);

drop trigger if exists retreat_registrations_updated_at on public.retreat_registrations;
create trigger retreat_registrations_updated_at before update on public.retreat_registrations
  for each row execute procedure public.set_updated_at();

alter table public.retreat_registrations enable row level security;

drop policy if exists "retreat_registrations_admin_all" on public.retreat_registrations;
create policy "retreat_registrations_admin_all" on public.retreat_registrations
  for all using (public.is_admin()) with check (public.is_admin());
