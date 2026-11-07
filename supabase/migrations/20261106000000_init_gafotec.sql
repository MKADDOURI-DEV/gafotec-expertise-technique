-- GAFOTEC: Base44 -> Supabase schema.
-- Access model: all site/admin data is read and written ONLY through server functions that use the
-- service role (same as Base44, where every entity was admin-only). The browser (anon/authenticated)
-- gets no table access except reading its own profile row. Admins also manage files in the `media` bucket.
-- Totals (verified by script): 6 tables, 5 RLS policies (1 on tables + 4 on storage.objects), 3 functions, 1 bucket.

-- ---------------------------------------------------------------- tables

-- One row per auth user; replaces Base44's built-in User (role, full_name, created_date).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  year integer,
  category text check (category in ('Industrie', 'Hôtellerie', 'Enseignement', 'Tourisme', 'Résidentiel')),
  location text,
  status text not null default 'Livré' check (status in ('Livré', 'En cours')),
  image text,
  summary text,
  description text,
  scope text[] not null default '{}',
  featured boolean not null default false,
  display_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  group_name text not null default 'Études' check (group_name in ('Direction', 'Études', 'Chantier', 'Support')),
  display_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text,
  kind text not null default 'image' check (kind in ('image', 'video')),
  url text not null,
  alt text,
  created_at timestamptz not null default now()
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text,
  email text not null,
  phone text not null,
  service text not null check (service in (
    'Climatisation & Ventilation', 'Plomberie sanitaire', 'Chauffage central',
    'Protection contre l’incendie', 'Désenfumage', 'Piscines',
    'Énergie solaire photovoltaïque', 'Autre / Plusieurs métiers')),
  message text not null,
  status text not null default 'nouveau' check (status in ('nouveau', 'traite')),
  created_at timestamptz not null default now()
);

create index site_projects_order_idx on public.site_projects (display_order, year);
create index team_members_order_idx on public.team_members (display_order);
create index contact_requests_status_created_idx on public.contact_requests (status, created_at desc);

-- ---------------------------------------------------------------- functions

-- New auth user -> profile with role 'user'. Only the service role can promote someone to 'admin'.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger touch_site_content before update on public.site_content for each row execute function public.touch_updated_at();
create trigger touch_site_projects before update on public.site_projects for each row execute function public.touch_updated_at();
create trigger touch_team_members before update on public.team_members for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- table privileges (least privilege)

revoke all on table public.profiles, public.site_content, public.site_projects,
  public.team_members, public.media_assets, public.contact_requests from anon, authenticated;
grant select on table public.profiles to authenticated;
grant all on table public.profiles, public.site_content, public.site_projects,
  public.team_members, public.media_assets, public.contact_requests to service_role;

-- ---------------------------------------------------------------- RLS

alter table public.profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.site_projects enable row level security;
alter table public.team_members enable row level security;
alter table public.media_assets enable row level security;
alter table public.contact_requests enable row level security;

-- The only table policy: a signed-in user reads their own profile (role/name). The other five tables have
-- no policy on purpose (deny-all for API roles); the service role bypasses RLS.
create policy "profiles: read own" on public.profiles for select to authenticated using (id = auth.uid());

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
on conflict (id) do nothing;

-- Public bucket: files are readable by URL. Listing and every write are admin-only.
-- select = list/download-by-API and the prerequisite for upsert, move, copy and delete.
create policy "media: admin select" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
