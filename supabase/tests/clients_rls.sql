-- Behaviour test for 20261117_site_clients.sql. Run AFTER the migration, in the SQL editor.
-- One DO block that ALWAYS ends in RAISE EXCEPTION, so the seeded row is rolled back. Expected message: "clients_rls: 9/9 PASS".
do $outer$
declare
  out text := ''; pass int := 0; total int := 0; ok boolean; n bigint; new_id uuid;
begin
  total := total + 1; select relrowsecurity into ok from pg_class where oid = 'public.site_clients'::regclass;
  if ok then pass := pass + 1; else out := out || ' [FAIL rls enabled]'; end if;

  total := total + 1; select not exists (select 1 from pg_policies where schemaname='public' and tablename='site_clients') into ok;
  if ok then pass := pass + 1; else out := out || ' [FAIL no policy]'; end if;

  total := total + 1;
  if not has_table_privilege('anon','public.site_clients','select') and not has_table_privilege('authenticated','public.site_clients','select') then pass := pass + 1; else out := out || ' [FAIL api roles have no privilege]'; end if;

  total := total + 1;
  if has_table_privilege('service_role','public.site_clients','select, insert, update, delete') then pass := pass + 1; else out := out || ' [FAIL service_role grants]'; end if;

  insert into public.site_clients (name) values ('Client de test') returning id into new_id;
  total := total + 1; select published = false and display_order = 0 and website = '' and logo_url = '' into ok from public.site_clients where id = new_id;
  if ok then pass := pass + 1; else out := out || ' [FAIL defaults: hidden, order 0, empty optional fields]'; end if;

  total := total + 1;
  begin insert into public.site_clients (name, website) values ('X Y', 'javascript:alert(1)'); out := out || ' [FAIL website scheme accepted]';
  exception when check_violation then pass := pass + 1; end;

  total := total + 1;
  begin insert into public.site_clients (name, logo_url) values ('X Y', 'http://insecure/logo.png'); out := out || ' [FAIL http logo accepted]';
  exception when check_violation then pass := pass + 1; end;

  total := total + 1;
  begin insert into public.site_clients (name, logo_url) values ('X Y', 'https://evil.test/storage/v1/object/public/media/clients/a.png'); out := out || ' [FAIL foreign logo host accepted]';
  exception when check_violation then pass := pass + 1; end;

  total := total + 1;
  begin insert into public.site_clients (name) values (' '); out := out || ' [FAIL blank name accepted]';
  exception when check_violation then pass := pass + 1; end;

  raise exception 'clients_rls: %/% PASS%', pass, total, out;
end $outer$;
