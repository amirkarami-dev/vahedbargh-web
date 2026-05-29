-- ─────────────────────────────────────────────────────────────────────────────
-- 00021_admin_panel_role.sql
-- Create the "AdminPanel" role and seed the webmaster admin user.
--
-- This migration:
--   1. Creates auth user  webmaster@kurdnezambargh.ir  (password: AdminPanel@2026)
--   2. Creates the corresponding public.profiles row
--   3. Assigns the "AdminPanel" role in public.user_roles
--
-- The migration is fully idempotent — safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_user_id   UUID;
  v_email     TEXT    := 'webmaster@kurdnezambargh.ir';
  v_password  TEXT    := 'AdminPanel@2026';
  v_client_id UUID    := 'a1000000-0000-0000-0000-000000000001';
BEGIN
  -- ── 1. Find or create the auth user ────────────────────────────────────────
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW()
    );
  END IF;

  -- ── 2. Create profile (idempotent) ─────────────────────────────────────────
  INSERT INTO public.profiles (id, nick_name, first_name, last_name, is_active)
  VALUES (v_user_id, 'webmaster', 'مدیر', 'وبسایت', TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ── 3. Assign AdminPanel role (idempotent) ─────────────────────────────────
  INSERT INTO public.user_roles (user_id, role, client_id)
  VALUES (v_user_id, 'AdminPanel', v_client_id)
  ON CONFLICT (user_id, role, client_id) DO NOTHING;

END $$;
