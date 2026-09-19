-- Vehicle Oil Maintenance foundation for Supabase/PostgreSQL
create extension if not exists pgcrypto;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plate text not null unique,
  brand text,
  model text,
  year int check (year is null or year >= 1900),
  current_km numeric(12,1) not null default 0 check (current_km >= 0),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.odometer_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  km numeric(12,1) not null check (km >= 0),
  recorded_at timestamptz not null default now(),
  operator_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists odometer_vehicle_date_idx on public.odometer_history(vehicle_id, recorded_at desc);

create table if not exists public.maintenance_rules (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_type text not null default 'GANTI_OLI',
  interval_km numeric(12,1) not null check (interval_km > 0),
  interval_days int not null check (interval_days > 0),
  warning_km numeric(12,1) not null default 500 check (warning_km >= 0),
  warning_days int not null default 14 check (warning_days >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_rule_id uuid references public.maintenance_rules(id) on delete set null,
  maintenance_type text not null check (maintenance_type in ('GANTI_OLI','TAMBAH_OLI')),
  maintenance_date timestamptz not null default now(),
  km numeric(12,1) not null check (km >= 0),
  oil_volume_liters numeric(8,2) check (oil_volume_liters is null or oil_volume_liters >= 0),
  oil_type text,
  notes text,
  operator_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists maintenance_vehicle_date_idx on public.maintenance_records(vehicle_id, maintenance_date desc);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_rule_id uuid references public.maintenance_rules(id) on delete cascade,
  event_type text not null check (event_type in ('WARNING','DUE','OVERDUE')),
  event_key text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING','SENT','FAILED')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_message_id text,
  error_message text
);

alter table public.vehicles enable row level security;
alter table public.odometer_history enable row level security;
alter table public.maintenance_rules enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.notification_events enable row level security;

-- Initial authenticated-user policies. Tighten by roles/organization when the app's auth model is finalized.
create policy "authenticated can read vehicles" on public.vehicles for select to authenticated using (true);
create policy "authenticated can manage vehicles" on public.vehicles for all to authenticated using (true) with check (true);
create policy "authenticated can read odometer" on public.odometer_history for select to authenticated using (true);
create policy "authenticated can insert odometer" on public.odometer_history for insert to authenticated with check (operator_id = auth.uid() or operator_id is null);
create policy "authenticated can read rules" on public.maintenance_rules for select to authenticated using (true);
create policy "authenticated can manage rules" on public.maintenance_rules for all to authenticated using (true) with check (true);
create policy "authenticated can read maintenance" on public.maintenance_records for select to authenticated using (true);
create policy "authenticated can insert maintenance" on public.maintenance_records for insert to authenticated with check (operator_id = auth.uid() or operator_id is null);
create policy "authenticated can read notifications" on public.notification_events for select to authenticated using (true);
