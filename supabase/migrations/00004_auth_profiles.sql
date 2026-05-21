-- Migration 00004: User profiles (extends auth.users), roles, auto-create trigger,
--                  and custom_access_token_hook that injects client_id + roles into JWT

CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id     uuid REFERENCES clients(id),
  first_name    text,
  last_name     text,
  national_code text,
  phone_number  text,
  avatar_url    text,
  section_id    smallint REFERENCES sections(id),
  city_id       smallint REFERENCES cities(id),
  user_type     smallint NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  expiry_date   timestamptz,
  score         int NOT NULL DEFAULT 0,
  bale_id       text,
  integrate_id  text,
  nick_name     text,
  theme_color   text DEFAULT '#3B82F6',
  legacy_hash   text,   -- temporary during password migration
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz
);

CREATE TABLE user_roles (
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id),
  PRIMARY KEY (user_id, role, client_id)
);

-- ─── Auto-create profile on new user ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number)
  VALUES (
    NEW.id,
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Custom Access Token Hook ─────────────────────────────────────────────────
-- Injects `cid` (client_id) and `roles` array into the JWT claims.
-- Must be registered in Supabase Dashboard → Auth → Hooks → Custom Access Token.
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims    jsonb;
  v_user_id uuid;
  v_client  uuid;
  v_roles   text[];
BEGIN
  v_user_id := (event ->> 'user_id')::uuid;
  claims    := event -> 'claims';

  -- Resolve the tenant (client_id) from the profile
  SELECT client_id
    INTO v_client
    FROM public.profiles
   WHERE id = v_user_id;

  -- Collect all roles for this user within that client
  SELECT ARRAY_AGG(role)
    INTO v_roles
    FROM public.user_roles
   WHERE user_id = v_user_id
     AND client_id = v_client;

  -- Inject custom claims
  claims := jsonb_set(claims, '{cid}',   to_jsonb(v_client::text));
  claims := jsonb_set(claims, '{roles}', COALESCE(to_jsonb(v_roles), '[]'::jsonb));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant the hook function execute permission to the supabase_auth_admin role
GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION custom_access_token_hook FROM PUBLIC;
