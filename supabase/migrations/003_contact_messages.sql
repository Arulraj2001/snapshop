-- ============================================================
-- MIGRATION 003 — Contact Messages table + RLS
-- Requires: 001_users.sql to be run first
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can submit a contact message
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can read and manage all contact messages
CREATE POLICY "Admins can view and update contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
        AND public.users.role = 'admin'
    )
  );
