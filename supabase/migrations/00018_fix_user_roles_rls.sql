-- Migration 00018: Fix user_roles RLS + add self-read policy
--
-- The existing user_roles_admin_access policy is self-referential:
-- it queries user_roles inside its own EXISTS check, which PostgreSQL
-- evaluates recursively — causing the policy to always return no rows.
--
-- Fix:
--   1. Drop the broken recursive policy
--   2. Add a simple, non-recursive self-read policy (any authenticated
--      user may read their own role rows)
--   3. Add a non-recursive admin-management policy using a separate
--      helper function so no recursion occurs

-- ── 1. Drop the broken recursive policy ──────────────────────────────────────
DROP POLICY IF EXISTS "user_roles_admin_access" ON user_roles;

-- ── 2. Self-read: any authenticated user can read their own roles ─────────────
CREATE POLICY "user_roles_self_read"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- ── 3. Admin management: admins can manage all roles within their client ──────
--    Uses a SECURITY DEFINER helper function to avoid recursion.

CREATE OR REPLACE FUNCTION is_admin_for_client(p_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
     WHERE user_id   = auth.uid()
       AND client_id = p_client_id
       AND role      = ANY (ARRAY['Administrator', 'SuperUser'])
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin_for_client TO authenticated;

CREATE POLICY "user_roles_admin_manage"
  ON user_roles FOR ALL
  USING (is_admin_for_client(client_id))
  WITH CHECK (is_admin_for_client(client_id));
