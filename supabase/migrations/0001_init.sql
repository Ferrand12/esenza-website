-- Esenza initial schema
-- Run in Supabase SQL editor or via `supabase db push`

create extension if not exists "btree_gist";

-- ============================================================================
-- PROFILES (admin users, extends auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- GUESTS (CRM)
-- ============================================================================
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text not null,
  country text,
  notes text,
  tags text[] not null default '{}',
  total_bookings int not null default 0,
  total_spent numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_email_idx on public.guests(email);
create index guests_phone_idx on public.guests(phone);

-- ============================================================================
-- BOOKINGS
-- ============================================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references public.guests(id) on delete restrict,
  check_in date not null,
  check_out date not null,
  num_guests int not null check (num_guests > 0),
  package text not null check (package in ('esencia', 'armonia', 'plenitud')),
  total_price numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  source text not null default 'web' check (source in ('web', 'airbnb', 'manual', 'whatsapp')),
  external_id text,
  special_requests text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_date_range check (check_out > check_in),
  constraint no_overlapping_bookings exclude using gist (
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create index bookings_guest_idx on public.bookings(guest_id);
create index bookings_dates_idx on public.bookings(check_in, check_out);
create index bookings_status_idx on public.bookings(status);

-- ============================================================================
-- CALENDAR BLOCKS (manual blocks + Airbnb imported dates)
-- ============================================================================
create table public.calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  reason text,
  source text not null default 'manual' check (source in ('manual', 'airbnb_sync', 'booking_com_sync', 'vrbo_sync')),
  external_id text,
  created_at timestamptz not null default now(),
  constraint valid_block_range check (end_date > start_date),
  unique (source, external_id)
);

create index calendar_blocks_dates_idx on public.calendar_blocks(start_date, end_date);

-- ============================================================================
-- COMMUNICATIONS (CRM log)
-- ============================================================================
create table public.communications (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp', 'phone', 'note')),
  direction text not null check (direction in ('inbound', 'outbound')),
  content text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index communications_guest_idx on public.communications(guest_id);
create index communications_booking_idx on public.communications(booking_id);

-- ============================================================================
-- SITE IMAGES (CMS)
-- ============================================================================
create table public.site_images (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  slot text not null,
  storage_path text not null,
  alt_text text,
  display_order int not null default 0,
  width int,
  height int,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (section, slot)
);

create index site_images_section_idx on public.site_images(section);

-- ============================================================================
-- SITE CONFIG (prices, contact info, iCal URLs, etc.)
-- ============================================================================
create table public.site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed default config
insert into public.site_config (key, value) values
  ('packages', '{"esencia": 350000, "armonia": 650000, "plenitud": 900000}'),
  ('contact', '{"whatsapp": "+573001234567", "email": "hola@esenza.co", "location": "Km 42 Vía Norte, Cundinamarca"}'),
  ('airbnb_ical_url', '""'),
  ('max_guests', '8')
on conflict (key) do nothing;

-- ============================================================================
-- SYNC LOG
-- ============================================================================
create table public.sync_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null check (status in ('success', 'failed', 'partial')),
  events_imported int not null default 0,
  errors jsonb,
  ran_at timestamptz not null default now()
);

create index sync_log_ran_at_idx on public.sync_log(ran_at desc);

-- ============================================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger guests_updated_at before update on public.guests
  for each row execute procedure public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute procedure public.set_updated_at();
create trigger site_images_updated_at before update on public.site_images
  for each row execute procedure public.set_updated_at();
create trigger site_config_updated_at before update on public.site_config
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- TRIGGER: update guest stats after booking status changes
-- ============================================================================
create or replace function public.update_guest_stats()
returns trigger language plpgsql as $$
begin
  update public.guests
  set
    total_bookings = (
      select count(*) from public.bookings
      where guest_id = coalesce(new.guest_id, old.guest_id)
        and status in ('confirmed', 'completed')
    ),
    total_spent = coalesce((
      select sum(total_price) from public.bookings
      where guest_id = coalesce(new.guest_id, old.guest_id)
        and status in ('confirmed', 'completed')
    ), 0)
  where id = coalesce(new.guest_id, old.guest_id);
  return coalesce(new, old);
end;
$$;

create trigger bookings_update_guest_stats
  after insert or update or delete on public.bookings
  for each row execute procedure public.update_guest_stats();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.guests enable row level security;
alter table public.bookings enable row level security;
alter table public.calendar_blocks enable row level security;
alter table public.communications enable row level security;
alter table public.site_images enable row level security;
alter table public.site_config enable row level security;
alter table public.sync_log enable row level security;

-- Helper: is current user an authenticated admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'staff')
  );
$$;

-- Profiles: users can read their own, owners can read all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Guests: admin only
create policy "guests_admin_all" on public.guests
  for all using (public.is_admin()) with check (public.is_admin());

-- Bookings: admin only (public creates via service role)
create policy "bookings_admin_all" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- Calendar blocks: admin only
create policy "calendar_blocks_admin_all" on public.calendar_blocks
  for all using (public.is_admin()) with check (public.is_admin());

-- Communications: admin only
create policy "communications_admin_all" on public.communications
  for all using (public.is_admin()) with check (public.is_admin());

-- Site images: PUBLIC READ, admin write
create policy "site_images_public_read" on public.site_images
  for select using (true);
create policy "site_images_admin_write" on public.site_images
  for insert with check (public.is_admin());
create policy "site_images_admin_update" on public.site_images
  for update using (public.is_admin());
create policy "site_images_admin_delete" on public.site_images
  for delete using (public.is_admin());

-- Site config: PUBLIC READ, admin write
create policy "site_config_public_read" on public.site_config
  for select using (true);
create policy "site_config_admin_write" on public.site_config
  for all using (public.is_admin()) with check (public.is_admin());

-- Sync log: admin only
create policy "sync_log_admin_all" on public.sync_log
  for all using (public.is_admin()) with check (public.is_admin());
