
DO $$
DECLARE
  v_agency uuid := '5ae57cb7-8f64-4ec4-8f2d-647e81dca6b5';
  r record;
  v_uid uuid;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('Karim Test',   'karim.test@sahara-tours.test',   '+212 600 000 001', 'Marrakech, Gueliz'),
    ('Youssef Test', 'youssef.test@sahara-tours.test', '+212 600 000 002', 'Marrakech, Medina')
  ) AS t(full_name, email, phone, base_location)
  LOOP
    -- Skip if email already has an auth user
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN
      CONTINUE;
    END IF;

    v_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_token, recovery_token,
      email_change, email_change_token_new,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_uid, 'authenticated', 'authenticated',
      r.email, crypt('Welcome123', gen_salt('bf')),
      now(), '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', r.full_name, 'role', 'driver', 'email_verified', true),
      now(), now()
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_uid, v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', r.email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now()
    );

    INSERT INTO public.drivers (agency_id, full_name, email, phone, base_location, status, auth_user_id)
    VALUES (v_agency, r.full_name, r.email, r.phone, r.base_location, 'available', v_uid);
  END LOOP;
END $$;
