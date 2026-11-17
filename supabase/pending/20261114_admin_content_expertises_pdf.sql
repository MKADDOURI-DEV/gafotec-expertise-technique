-- NOT APPLIED. Pending the owner's explicit approval. (v2 final — verified trigger/constraint handling + effective table AND column privilege self-checks + exact grants)
-- Admin content features: « Nos expertises » table, PDF allowed in the `media` bucket, quote form made dynamic.
-- Single transaction: any failed check (see the explicit exceptions in blocks 3 and 4) rolls EVERYTHING back.
-- Idempotent (safe to run twice). No data and no file is deleted; existing rows and files are untouched.
begin;

-- ============================================================ 1. site_expertises (« Nos expertises »)
-- Same conventions as the other content tables: RLS on, NO table policy (deny-all for API roles; the server
-- reads/writes with the service role after requireUser + assertAdmin), least-privilege grants.
create table if not exists public.site_expertises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  short text not null default '',
  excerpt text not null default '',
  description text not null default '',
  interventions jsonb not null default '[]'::jsonb check (jsonb_typeof(interventions) = 'array'),
  expertise jsonb not null default '[]'::jsonb check (jsonb_typeof(expertise) = 'array'),
  image text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_expertises_order_idx on public.site_expertises (display_order);

-- The updated_at trigger. NOTHING is dropped or replaced: an existing `touch_site_expertises` trigger is kept as is
-- when its definition is exactly the expected one, and the script aborts when it is different. Other triggers
-- (on this table or any other table) are never looked at, so they are all preserved.
do $$
declare
  t pg_trigger%rowtype;
begin
  if not exists (select 1 from pg_proc p
                  where p.pronamespace = 'public'::regnamespace and p.proname = 'touch_updated_at' and p.pronargs = 0) then
    raise exception 'Block 1 aborted: function public.touch_updated_at() was not found. Nothing was changed.';
  end if;

  select * into t from pg_trigger
   where tgrelid = 'public.site_expertises'::regclass and tgname = 'touch_site_expertises' and not tgisinternal;

  if not found then
    create trigger touch_site_expertises before update on public.site_expertises
      for each row execute function public.touch_updated_at();
  -- coalesce(..., false): if any attribute were NULL the comparison is NOT a match, so the script aborts (never silently accepts).
  elsif not coalesce(t.tgfoid = 'public.touch_updated_at()'::regprocedure -- executes public.touch_updated_at()
         and t.tgtype = 19            -- 1 (row) + 2 (before) + 16 (update) = BEFORE UPDATE ... FOR EACH ROW
         and t.tgenabled = 'O'        -- enabled
         and t.tgnargs = 0 and t.tgqual is null           -- no arguments, no WHEN
         and cardinality(t.tgattr::smallint[]) = 0        -- no UPDATE OF column list (empty int2vector)
         and t.tgoldtable is null and t.tgnewtable is null and t.tgconstraint = 0, false) then
    raise exception 'Block 1 aborted: trigger touch_site_expertises already exists on public.site_expertises with a different definition: [%]. Nothing was changed.',
      pg_get_triggerdef(t.oid);
  end if;
end $$;

-- Supabase's default privileges give every new public table ALL for anon, authenticated and service_role, so the
-- REVOKE must include service_role as well (otherwise the narrower GRANT below would change nothing), and PUBLIC too
-- (a privilege granted to PUBLIC is inherited by every role, service_role included).
revoke all on table public.site_expertises from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.site_expertises to service_role;
alter table public.site_expertises enable row level security;

-- Seed: the 7 expertises currently built into the site, so nothing disappears and « Climatisation & Ventilation »
-- (and the others) can be edited from the admin. `on conflict do nothing` = never overwrites later edits.
insert into public.site_expertises (slug, title, short, excerpt, description, interventions, expertise, image, display_order)
values
  ('cvc', 'Climatisation & Ventilation', 'CVC', 'Systèmes VRV, production d’eau glacée, centrales de traitement d’air et réseaux de ventilation.', 'GAFOTEC étudie, dimensionne et met en œuvre les installations de climatisation et de ventilation des bâtiments : de l’analyse des besoins thermiques jusqu’au réglage final et à la mise en service. Nos équipes travaillent sur les systèmes à détente directe comme sur les installations hydrauliques, en coordination avec les autres corps d’état.', '["Systèmes VRV / VRF et unités Split","Groupes d’eau glacée et réseaux hydrauliques","Centrales de traitement d’air (CTA)","Réseaux de gaines et diffusion d’air","Ventilation mécanique et renouvellement d’air","Traitement d’air, filtration et régulation"]'::jsonb, '["Bilan thermique et dimensionnement des équipements","Sélection technique et coordination avec le bureau d’études","Pose, raccordement, essais et équilibrage","Entretien préventif et dépannage"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/a4a868d0e8f1-f8c405548_generated_f21a34a5.png', 0),
  ('plomberie', 'Plomberie sanitaire', 'Plomberie', 'Réseaux d’alimentation en eau, évacuations et installations sanitaires complètes.', 'Nous concevons et réalisons les réseaux de plomberie sanitaire des bâtiments tertiaires, hôteliers, industriels et résidentiels : alimentation en eau froide et eau chaude sanitaire, évacuation des eaux usées et pluviales, appareils sanitaires et équipements de production d’eau chaude.', '["Colonnes montantes et distributions horizontales","Surpresseurs, groupes de pompage et stockage","Production d’eau chaude sanitaire","Réseaux d’évacuation et ventilation primaire","Appareils sanitaires et robinetterie","Comptage, filtration et traitement de l’eau"]'::jsonb, '["Calcul des débits et dimensionnement des réseaux","Plans d’exécution et coordination des réservations","Essais d’étanchéité et mise en service","Maintenance des installations existantes"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/e69816f1368a-9b91d2577_generated_9704d63f.png', 1),
  ('chauffage', 'Chauffage central', 'Chauffage', 'Production de chaleur, réseaux de distribution et émetteurs adaptés à chaque bâtiment.', 'GAFOTEC installe des solutions de chauffage central dimensionnées pour les besoins réels du bâtiment : production de chaleur, distribution, émission et régulation. Nous privilégions les équipements fiables et les réglages qui limitent la consommation d’énergie.', '["Chaudières et production de chaleur","Réseaux de distribution et pompes","Radiateurs et corps de chauffe","Planchers chauffants","Aérothermes et unités de chauffage","Traitement de l’eau et régulation"]'::jsonb, '["Étude des déperditions et dimensionnement","Choix des émetteurs et équilibrage des circuits","Raccordement gaz et sécurité de combustion","Entretien et remise en conformité"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/518a2a77466f-e8a4aa313_generated_2c060ec3.png', 2),
  ('protection-incendie', 'Protection contre l’incendie', 'Incendie', 'Réseaux sprinkler, RIA, détection et moyens de secours conformes à la réglementation.', 'La sécurité incendie fait partie intégrante de nos installations. Nous réalisons les réseaux et équipements de protection incendie des bâtiments recevant du public, industriels et hôteliers, en respectant les prescriptions réglementaires et les exigences des bureaux de contrôle.', '["Réseaux sprinkler et robinets d’incendie armés","Poteaux et bouches d’incendie","Extincteurs et moyens de première intervention","Détection automatique et alarme","Compartimentage et portes coupe-feu","Signalisation et éclairage de sécurité"]'::jsonb, '["Conception des réseaux selon la réglementation en vigueur","Coordination avec les organismes de contrôle","Essais de pression et réception des installations","Vérifications périodiques et maintenance"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/3be490adf9d6-2f15695d1_generated_a3c52abd.png', 3),
  ('desenfumage', 'Désenfumage', 'Désenfumage', 'Évacuation des fumées, cantons de désenfumage et conduits résistants au feu.', 'Le désenfumage protège l’évacuation des occupants et facilite l’intervention des secours. GAFOTEC réalise les systèmes de désenfumage naturel et mécanique : exutoires, volets, ventilateurs d’extraction, conduits et commandes asservies.', '["Ventilation mécanique de désenfumage","Exutoires de fumée et volets","Conduits et gaines résistantes au feu","Cantons et compartiments de désenfumage","Commandes, asservissements et détection","Systèmes de mise en surpression des escaliers"]'::jsonb, '["Dimensionnement des débits d’extraction","Étude des cantons et des circuits d’évacuation","Intégration au système de sécurité incendie","Essais fonctionnels et vérifications réglementaires"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/3c66e4dd6a1c-44d91c8b4_generated_879dea90.png', 4),
  ('piscines', 'Piscines', 'Piscines', 'Filtration, hydraulique, traitement de l’eau et locaux techniques de piscine.', 'GAFOTEC équipe les piscines des hôtels, résidences et équipements sportifs : hydraulique, filtration, traitement de l’eau, chauffage et éclairage. Les locaux techniques sont conçus pour être accessibles, ventilés et simples à entretenir.', '["Filtration et traitement de l’eau","Locaux techniques et hydraulique de bassin","Pompes, vannes et rampes de refoulement","Chauffage et régulation de l’eau","Éclairage immergé","Entretien et hivernage"]'::jsonb, '["Calcul des volumes et des temps de renouvellement","Dimensionnement des groupes de filtration","Coordination avec les lots gros œuvre et carrelage","Suivi de la qualité de l’eau et maintenance"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/b91e7abc3624-c9762b0ab_generated_72f7021e.png', 5),
  ('photovoltaique', 'Énergie solaire photovoltaïque', 'Photovoltaïque', 'Études de faisabilité, dimensionnement, installation, stockage et maintenance.', 'GAFOTEC accompagne les maîtres d’ouvrage dans leurs projets d’autoconsommation solaire : étude de faisabilité, dimensionnement de la centrale, choix des modules et onduleurs, installation, mise en service puis suivi des performances dans le temps.', '["Études de faisabilité et de rentabilité","Dimensionnement des installations","Conception des systèmes photovoltaïques","Installation des panneaux solaires","Onduleurs et stockage d’énergie","Mise en service et maintenance"]'::jsonb, '["Analyse de la consommation et du gisement solaire","Optimisation des performances énergétiques","Raccordement et conformité électrique","Suivi de production et maintenance préventive"]'::jsonb, 'https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/1f40ca0466a6-67bb9c6e2_generated_28cae7eb.png', 6)
on conflict (slug) do nothing;

-- ============================================================ 2. PDF allowed in the `media` bucket
-- Today only images + mp4/webm are accepted. The file size limit (50 MiB, the Free-plan maximum) is NOT changed.
update storage.buckets
   set allowed_mime_types = array_append(allowed_mime_types, 'application/pdf')
 where id = 'media'
   and allowed_mime_types is not null
   and not ('application/pdf' = any(allowed_mime_types));

-- ============================================================ 3. Quote form follows the editable expertises
-- contact_requests.service is limited by an unnamed inline CHECK in the init migration, which Postgres named
-- `contact_requests_service_check`: it only allows the 7 original titles + "Autre / Plusieurs métiers".
-- Once an expertise can be renamed or added, that CHECK would reject legitimate quote requests, so it is replaced by
-- a plain length check `contact_requests_service_length`; the server (submitQuoteRequest) validates the value against
-- the current expertises. NO constraint is ever dropped without its definition being verified first:
--   * contact_requests_service_check  is dropped only if its definition is exactly the original one;
--   * contact_requests_service_length is never dropped or replaced; if it already exists with another definition
--     the whole script aborts. Both reference definitions are printed by THIS server from a temp table.
do $$
declare
  old_name constant text := 'contact_requests_service_check';
  new_name constant text := 'contact_requests_service_length';
  old_def text;
  new_def text;
  expected_old text;
  expected_new text;
begin
  select pg_get_constraintdef(c.oid) into old_def
    from pg_constraint c where c.conrelid = 'public.contact_requests'::regclass and c.conname = old_name;
  select pg_get_constraintdef(c.oid) into new_def
    from pg_constraint c where c.conrelid = 'public.contact_requests'::regclass and c.conname = new_name;

  create temp table _expected_service_constraints (
    service text not null,
    constraint ref_old check (service in (
      'Climatisation & Ventilation', 'Plomberie sanitaire', 'Chauffage central',
      'Protection contre l’incendie', 'Désenfumage', 'Piscines',
      'Énergie solaire photovoltaïque', 'Autre / Plusieurs métiers')),
    constraint ref_new check (char_length(service) between 2 and 160)
  ) on commit drop;
  select pg_get_constraintdef(c.oid) into expected_old
    from pg_constraint c where c.conrelid = '_expected_service_constraints'::regclass and c.conname = 'ref_old';
  select pg_get_constraintdef(c.oid) into expected_new
    from pg_constraint c where c.conrelid = '_expected_service_constraints'::regclass and c.conname = 'ref_new';

  if new_def is not null and new_def is distinct from expected_new then
    raise exception 'Block 3 aborted: constraint % already exists with a different definition. Current: [%]  Expected: [%]. Nothing was changed.',
      new_name, new_def, expected_new;
  end if;

  if old_def is null and new_def is null then
    raise exception 'Block 3 aborted: expected constraint % was not found on public.contact_requests. Nothing was changed.', old_name;
  end if;

  if old_def is not null then
    if old_def is distinct from expected_old then
      raise exception 'Block 3 aborted: constraint % does not have the expected definition. Current: [%]  Expected: [%]. Nothing was changed.',
        old_name, old_def, expected_old;
    end if;
    execute format('alter table public.contact_requests drop constraint %I', old_name);
  else
    raise notice 'Block 3: % is already gone and % is in place: nothing to drop.', old_name, new_name;
  end if;

  if new_def is null then
    alter table public.contact_requests
      add constraint contact_requests_service_length check (char_length(service) between 2 and 160);
  end if;
end $$;

-- ============================================================ 4. Self-checks (any failure rolls everything back)
-- site_expertises must be reachable ONLY through the service role: RLS on, no policy, no grant to anon/authenticated.
do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.site_expertises'::regclass) then
    raise exception 'Check failed: RLS is not enabled on public.site_expertises.';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_expertises') then
    raise exception 'Check failed: public.site_expertises must have no policy (server-only access).';
  end if;
  -- has_table_privilege() reports EFFECTIVE privileges (direct grants + PUBLIC + inherited role memberships).
  if exists (select 1 from pg_class c cross join lateral aclexplode(c.relacl) a
              where c.oid = 'public.site_expertises'::regclass and a.grantee = 0) then
    raise exception 'Check failed: PUBLIC must have no privilege on public.site_expertises.';
  end if;
  -- Column-level ACLs: nothing may be granted to PUBLIC (grantee = 0) on any column.
  if exists (select 1 from pg_attribute att cross join lateral aclexplode(att.attacl) a
              where att.attrelid = 'public.site_expertises'::regclass and att.attnum > 0 and not att.attisdropped
                and a.grantee = 0) then
    raise exception 'Check failed: PUBLIC must have no column-level privilege on public.site_expertises.';
  end if;
  -- has_any_column_privilege() is effective too (table-level OR column-level, direct OR via PUBLIC OR via role membership).
  if has_any_column_privilege('anon', 'public.site_expertises', 'SELECT,INSERT,UPDATE,REFERENCES')
     or has_any_column_privilege('authenticated', 'public.site_expertises', 'SELECT,INSERT,UPDATE,REFERENCES') then
    raise exception 'Check failed: anon/authenticated must have NO column-level privilege on public.site_expertises.';
  end if;
  if has_table_privilege('anon', 'public.site_expertises', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
     or has_table_privilege('authenticated', 'public.site_expertises', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
    raise exception 'Check failed: anon/authenticated must have NO privilege on public.site_expertises.';
  end if;
  if has_table_privilege('service_role', 'public.site_expertises', 'TRUNCATE,REFERENCES,TRIGGER')
     or has_any_column_privilege('service_role', 'public.site_expertises', 'REFERENCES') then
    raise exception 'Check failed: service_role must have ONLY SELECT, INSERT, UPDATE and DELETE on public.site_expertises.';
  end if;
  if not (has_table_privilege('service_role', 'public.site_expertises', 'SELECT')
          and has_table_privilege('service_role', 'public.site_expertises', 'INSERT')
          and has_table_privilege('service_role', 'public.site_expertises', 'UPDATE')
          and has_table_privilege('service_role', 'public.site_expertises', 'DELETE')) then
    raise exception 'Check failed: service_role needs SELECT, INSERT, UPDATE and DELETE on public.site_expertises.';
  end if;
  if not exists (select 1 from storage.buckets where id = 'media' and 'application/pdf' = any(allowed_mime_types)) then
    raise exception 'Check failed: application/pdf is not allowed in the media bucket.';
  end if;
end $$;

commit;
