-- GAFOTEC: schema migrated from Base44 entities. Review only; applied once the Supabase project exists.

-- Profiles: one row per auth user; `role` replaces the Base44 User.role field.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Every new auth user gets a profile with role 'user'. Only the service role can promote to 'admin'.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

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

create trigger touch_site_content before update on public.site_content for each row execute function public.touch_updated_at();
create trigger touch_site_projects before update on public.site_projects for each row execute function public.touch_updated_at();
create trigger touch_team_members before update on public.team_members for each row execute function public.touch_updated_at();

-- RLS everywhere.
alter table public.profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.site_projects enable row level security;
alter table public.team_members enable row level security;
alter table public.media_assets enable row level security;
alter table public.contact_requests enable row level security;

-- Profiles: a user reads only their own row; nobody edits roles through the API (service role only).
create policy "profiles: read own" on public.profiles for select to authenticated using (id = auth.uid());

-- Public site data: world-readable, admin-write.
create policy "site_content: public read" on public.site_content for select to anon, authenticated using (true);
create policy "site_content: admin write" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_projects: public read" on public.site_projects for select to anon, authenticated using (true);
create policy "site_projects: admin write" on public.site_projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "team_members: public read" on public.team_members for select to anon, authenticated using (true);
create policy "team_members: admin write" on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin-only (same as Base44): the public quote form writes through a server function (service role, validated by zod).
create policy "media_assets: admin all" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "contact_requests: admin all" on public.contact_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: public bucket for site media; only admins can upload/change/delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm'])
on conflict (id) do nothing;

create policy "media: admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media: admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
