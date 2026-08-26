-- ============================================================
-- MIGRATION 001 — Users table + RLS
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  avatar_url text,
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  role text NOT NULL DEFAULT 'user',
  wallet_balance numeric NOT NULL DEFAULT 0,
  post_count integer NOT NULL DEFAULT 0,
  has_paid_platform_fee boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    substring(md5(NEW.id::text) from 1 for 8)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- To make yourself an admin after signing up:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
