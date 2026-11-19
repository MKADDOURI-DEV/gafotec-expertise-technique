-- NOT APPLIED. Pending the owner's explicit approval.
-- « Nos clients »: table public.site_clients.
-- Single transaction, idempotent (safe to run twice). No existing row, file or setting is modified or deleted.
-- Same conventions as site_expertises: RLS ON, NO table policy (deny-all for the API roles anon/authenticated);
-- the server reads and writes with the service role AFTER requireUser + assertAdmin, and the public read goes through
-- a server function that only returns published rows. Nothing is seeded: no client name is invented.
-- The `media` bucket already accepts png/jpeg/webp/gif, mp4/webm and pdf (see 20261114_admin_content_expertises_pdf.sql),
-- so logos, the presentation video/PDF and the home page video need NO storage change.
-- logo_url is restricted to a public object of a Supabase project under media/clients/ (the server also pins it to THIS project).
-- Verify afterwards with: supabase/tests/clients_rls.sql (rolls back everything it seeds).
begin;

create table if not exists public.site_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  sector text not null default '' check (char_length(sector) <= 80),
  description text not null default '' check (char_length(description) <= 400),
  website text not null default '' check (website = '' or (website ~* '^https?://' and char_length(website) <= 300)),
  logo_url text not null default '' check (logo_url = '' or (logo_url ~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/media/clients/[^?#]+$' and char_length(logo_url) <= 700)),
  logo_path text not null default '' check (char_length(logo_path) <= 300),
  display_order integer not null default 0 check (display_order between 0 and 9999),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_clients_order_idx on public.site_clients (published, display_order);

-- updated_at trigger. Nothing is dropped or replaced: an existing trigger of the same name is kept only when its
-- definition is exactly the expected one, otherwise the script aborts (and the whole transaction rolls back).
do $$
declare
  t pg_trigger%rowtype;
begin
  if not exists (select 1 from pg_proc p
                  where p.pronamespace = 'public'::regnamespace and p.proname = 'touch_updated_at' and p.pronargs = 0) then
    raise exception 'Aborted: function public.touch_updated_at() was not found. Nothing was changed.';
  end if;

  select * into t from pg_trigger
   where tgrelid = 'public.site_clients'::regclass and tgname = 'touch_site_clients' and not tgisinternal;

  if not found then
    create trigger touch_site_clients before update on public.site_clients
      for each row execute function public.touch_updated_at();
  elsif not coalesce(t.tgfoid = 'public.touch_updated_at()'::regprocedure
         and t.tgtype = 19 and t.tgenabled = 'O'
         and t.tgnargs = 0 and t.tgqual is null
         and cardinality(t.tgattr::smallint[]) = 0
         and t.tgoldtable is null and t.tgnewtable is null and t.tgconstraint = 0, false) then
    raise exception 'Aborted: trigger touch_site_clients already exists with a different definition: [%]. Nothing was changed.',
      pg_get_triggerdef(t.oid);
  end if;
end $$;

-- Supabase default privileges grant ALL on new public tables to anon, authenticated and service_role:
-- revoke from all of them (and PUBLIC), then give the service role only what the server functions need.
revoke all on table public.site_clients from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.site_clients to service_role;
alter table public.site_clients enable row level security;

-- Self-check: the table is deny-all for the API roles and has no policy. Any failure rolls everything back.
do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.site_clients'::regclass) then
    raise exception 'Aborted: RLS is not enabled on public.site_clients.';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_clients') then
    raise exception 'Aborted: unexpected policy on public.site_clients (the table must stay deny-all for API roles).';
  end if;
  if has_table_privilege('anon', 'public.site_clients', 'select')
     or has_table_privilege('authenticated', 'public.site_clients', 'select') then
    raise exception 'Aborted: anon/authenticated can read public.site_clients.';
  end if;
  if not has_table_privilege('service_role', 'public.site_clients', 'select, insert, update, delete') then
    raise exception 'Aborted: service_role cannot use public.site_clients.';
  end if;
end $$;

commit;
