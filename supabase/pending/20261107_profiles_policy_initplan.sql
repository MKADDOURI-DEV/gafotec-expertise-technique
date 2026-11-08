-- NOT APPLIED. Pending the owner's approval ("Approved fix").
-- Supabase performance advisor (auth_rls_initplan): evaluate auth.uid() once per statement instead of once per row.
-- Behaviour is identical; the policy stays "a signed-in user reads only their own profile".
alter policy "profiles: read own" on public.profiles using (id = (select auth.uid()));
