-- Behaviour tests for migration init_gafotec: one DO block that ALWAYS ends in RAISE EXCEPTION, so everything it seeds is rolled back.
-- Result (34/34 expected) is returned in the error message. Run in the SQL editor / execute_sql.
do $outer$
declare
  admin_id uuid := '00000000-0000-0000-0000-0000000000a1';
  user_id  uuid := '00000000-0000-0000-0000-0000000000b2';
  out text := ''; pass int := 0; total int := 0; r text; idt text; meta_role text;
begin
  -- helper: run a statement AS a role with JWT claims, return outcome (all inside this one transaction)
  execute $f$
    create function pg_temp.run_as(r text, uid uuid, stmt text, out ident text, out res text) language plpgsql as $b$
    declare cnt bigint;
    begin
      begin
        execute format('set local role %I', r);
        perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', r)::text, true);
        perform set_config('request.jwt.claim.sub', coalesce(uid::text, ''), true);
        perform set_config('request.jwt.claim.role', r, true);
        ident := current_user || ' uid=' || coalesce(auth.uid()::text, 'null');
        execute stmt; get diagnostics cnt = row_count;
        res := 'ALLOWED rows=' || cnt;
        reset role;
      exception when others then
        res := 'DENIED ' || sqlstate;   -- subtransaction rolled back: role/claims restored
      end;
    end $b$ $f$;

  

  -- seed (as the migration owner)
  insert into auth.users (id, email, raw_user_meta_data) values
    (admin_id, 'admin@test.local', '{"full_name":"Admin T","role":"admin"}'),   -- metadata tries to claim admin
    (user_id,  'user@test.local',  '{}');
  select role into meta_role from public.profiles where id = admin_id;           -- metadata said role=admin
  update public.profiles set role = 'admin' where id = admin_id;                  -- promotion path (privileged only)
  insert into public.site_projects (title, slug) values ('t', 't-1');
  insert into public.site_content (key, value) values ('k', 'v');
  insert into public.team_members (name, role) values ('n', 'r');
  insert into public.media_assets (url) values ('http://x');
  insert into public.contact_requests (full_name, email, phone, service, message)
    values ('n', 'e@x.io', '123456', 'Piscines', 'm');
  insert into storage.buckets (id, name) values ('other', 'other') on conflict (id) do nothing;
  insert into storage.objects (bucket_id, name) values ('media', 'seed.jpg'), ('other', 'seed2.jpg');

  -- case table: (label, role, uid, statement, expected)
  declare
    cases text[][] := array[
     ['A1 anon select site_projects','anon','','select * from public.site_projects','DENIED 42501'],
     ['A2 anon select contact_requests','anon','','select * from public.contact_requests','DENIED 42501'],
     ['A3 anon select media_assets','anon','','select * from public.media_assets','DENIED 42501'],
     ['A4 anon select profiles','anon','','select * from public.profiles','DENIED 42501'],
     ['A5 anon insert contact_requests','anon','',$q$insert into public.contact_requests (full_name,email,phone,service,message) values ('a','b@c.d','123456','Piscines','m')$q$,'DENIED 42501'],
     ['A6 anon list storage.objects','anon','','select * from storage.objects','ALLOWED rows=0'],
     ['A7 anon insert storage.objects','anon','',$q$insert into storage.objects (bucket_id,name) values ('media','a.jpg')$q$,'DENIED 42501'],
     ['U1 user select profiles (own only)','authenticated',user_id::text,'select * from public.profiles','ALLOWED rows=1'],
     ['U2 user read admin profile','authenticated',user_id::text,format('select * from public.profiles where id=%L',admin_id),'ALLOWED rows=0'],
     ['U3 user UPDATE own role -> admin','authenticated',user_id::text,format('update public.profiles set role=%L where id=%L','admin',user_id),'DENIED 42501'],
     ['U4 user INSERT profile','authenticated',user_id::text,format('insert into public.profiles (id,role) values (gen_random_uuid(),%L)','admin'),'DENIED 42501'],
     ['U5 user DELETE profile','authenticated',user_id::text,format('delete from public.profiles where id=%L',user_id),'DENIED 42501'],
     ['U6 user select site_projects','authenticated',user_id::text,'select * from public.site_projects','DENIED 42501'],
     ['U7 user insert contact_requests','authenticated',user_id::text,$q$insert into public.contact_requests (full_name,email,phone,service,message) values ('a','b@c.d','123456','Piscines','m')$q$,'DENIED 42501'],
     ['U8 user select media_assets','authenticated',user_id::text,'select * from public.media_assets','DENIED 42501'],
     ['U9 user list storage (media)','authenticated',user_id::text,'select * from storage.objects','ALLOWED rows=0'],
     ['U10 user upload storage (media)','authenticated',user_id::text,$q$insert into storage.objects (bucket_id,name) values ('media','u.jpg')$q$,'DENIED 42501'],
     ['U11 user update storage object','authenticated',user_id::text,$q$update storage.objects set name='z.jpg' where bucket_id='media'$q$,'ALLOWED rows=0'],
     ['U13 user is_admin() is false','authenticated',user_id::text,'select 1 where not public.is_admin()','ALLOWED rows=1'],
     ['U14 user call handle_new_user()','authenticated',user_id::text,'select public.handle_new_user()','DENIED 42501'],
     ['D1 admin select profiles (own only)','authenticated',admin_id::text,'select * from public.profiles','ALLOWED rows=1'],
     ['D2 admin UPDATE profiles via API','authenticated',admin_id::text,format('update public.profiles set role=%L where id=%L','admin',admin_id),'DENIED 42501'],
     ['D3 admin direct select site_projects','authenticated',admin_id::text,'select * from public.site_projects','DENIED 42501'],
     ['D4 admin list storage (media only)','authenticated',admin_id::text,'select * from storage.objects','ALLOWED rows=1'],
     ['D5 admin upload storage (media)','authenticated',admin_id::text,$q$insert into storage.objects (bucket_id,name) values ('media','d.jpg')$q$,'ALLOWED rows=1'],
     ['D6 admin update storage (media)','authenticated',admin_id::text,$q$update storage.objects set name='seed-renamed.jpg' where bucket_id='media' and name='seed.jpg'$q$,'ALLOWED rows=1'],
     ['D7 admin upload to OTHER bucket','authenticated',admin_id::text,$q$insert into storage.objects (bucket_id,name) values ('other','d.jpg')$q$,'DENIED 42501'],
     ['D8 admin is_admin() true','authenticated',admin_id::text,'select 1 where public.is_admin()','ALLOWED rows=1'],
     ['S1 service select site_projects','service_role','','select * from public.site_projects','ALLOWED rows=1'],
     ['S2 service insert contact_requests','service_role','',$q$insert into public.contact_requests (full_name,email,phone,service,message) values ('a','b@c.d','123456','Piscines','m')$q$,'ALLOWED rows=1'],
     ['S3 service read media_assets','service_role','','select * from public.media_assets','ALLOWED rows=1'],
     ['S4 service promote profile (admin path)','service_role','',format('update public.profiles set role=%L where id=%L','admin',user_id),'ALLOWED rows=1'],
     ['S5 service sees all storage objects','service_role','','select * from storage.objects','ALLOWED rows=3']
    ];
    i int;
  begin
    for i in 1 .. array_length(cases, 1) loop
      select x.ident, x.res into idt, r from pg_temp.run_as(cases[i][2], nullif(cases[i][3], '')::uuid, cases[i][4]) x;
      total := total + 1;
      if r = cases[i][5] then pass := pass + 1; end if;
      out := out || rpad(cases[i][1], 40) || ' | ' || rpad(idt, 58) || ' | ' || rpad(r, 18) || ' | ' ||
             case when r = cases[i][5] then 'PASS' else 'FAIL (expected ' || cases[i][5] || ')' end || E'\n';
    end loop;
  end;
  -- extra checks outside role switching
  out := out || 'M0 signup with metadata {role:admin} -> profile role = ' || meta_role || ' | ' || case when meta_role='user' then 'PASS' else 'FAIL' end || E'\n';
  if meta_role='user' then pass := pass+1; end if; total := total+1;
  raise exception E'RESULTS\n%\nPASS %/%\nservice_role bypassrls=% ; trigger-created profiles=%', out, pass, total,
    (select rolbypassrls from pg_roles where rolname='service_role'), (select count(*) from public.profiles);
end $outer$;
