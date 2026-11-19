-- MANUAL ROLLBACK for 20261117_site_clients.sql. DESTRUCTIVE: drops every client row. Never run automatically.
-- Uploaded logos stay in the `media` bucket under clients/ (delete them from the Storage UI if wanted).
begin;
drop table if exists public.site_clients;
commit;
