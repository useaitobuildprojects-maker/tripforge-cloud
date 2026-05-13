
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_agency_created_idx
  ON public.contact_messages (agency_id, created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    agency_id IS NOT NULL
    AND length(trim(name)) > 0
    AND length(trim(email)) > 0
    AND length(trim(message)) > 0
    AND status = 'new'
  );

CREATE POLICY "Agency members can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_members.agency_id FROM agency_members
      WHERE agency_members.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Agency members can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_members.agency_id FROM agency_members
      WHERE agency_members.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    agency_id IN (
      SELECT agency_members.agency_id FROM agency_members
      WHERE agency_members.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Agency members can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_members.agency_id FROM agency_members
      WHERE agency_members.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );
