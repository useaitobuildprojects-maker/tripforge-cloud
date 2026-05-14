CREATE OR REPLACE FUNCTION public.create_driver_user(p_driver_id uuid, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email text;
  v_full_name text;
  v_agency_id uuid;
  v_existing uuid;
  v_new_user_id uuid;
  v_clean_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, full_name, agency_id, auth_user_id
    INTO v_email, v_full_name, v_agency_id, v_existing
    FROM public.drivers
    WHERE id = p_driver_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Driver has no email set';
  END IF;

  -- Permission: super_admin OR member of the driver's agency
  IF NOT (
    public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.agency_members
      WHERE user_id = auth.uid() AND agency_id = v_agency_id
    )
  ) THEN
    RAISE EXCEPTION 'Not authorised for this driver';
  END IF;

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'Driver already has an account';
  END IF;

  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  v_clean_email := lower(trim(v_email));

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_clean_email) THEN
    RAISE EXCEPTION 'An account with this email already exists';
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token,
    email_change, email_change_token_new,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    v_clean_email, crypt(p_password, gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', v_full_name, 'role', 'driver', 'email_verified', true),
    now(), now()
  )
  RETURNING id INTO v_new_user_id;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), v_new_user_id, v_new_user_id::text,
    jsonb_build_object('sub', v_new_user_id::text, 'email', v_clean_email, 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now()
  );

  UPDATE public.drivers
    SET auth_user_id = v_new_user_id
    WHERE id = p_driver_id;

  RETURN v_new_user_id;
END;
$$;