-- Rollback of 20261106000000_init_gafotec (safe only while the tables are empty).
-- The bucket `media` cannot be deleted with SQL (Storage protects it): delete it in Dashboard > Storage or with the Storage API.
-- Then remove the migration record: delete from supabase_migrations.schema_migrations where name = 'init_gafotec';
drop policy if exists "media: admin select" on storage.objects;
drop policy if exists "media: admin insert" on storage.objects;
drop policy if exists "media: admin update" on storage.objects;
drop policy if exists "media: admin delete" on storage.objects;
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.contact_requests, public.media_assets, public.team_members,
  public.site_projects, public.site_content, public.profiles cascade;
drop function if exists public.handle_new_user();
drop function if exists public.touch_updated_at();
drop function if exists public.is_admin();
