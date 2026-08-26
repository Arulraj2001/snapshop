-- ============================================================
-- MIGRATION 002 — Core tables: products, referrals, payments,
--                 clicks, withdrawal_requests, platform_config
-- Requires: 001_users.sql to be run first
-- ============================================================


-- ============================================================
-- 1. PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  offer_price numeric NOT NULL,
  mrp numeric,
  store text NOT NULL CHECK (store IN ('Amazon','Flipkart','Meesho','Myntra')),
  category text NOT NULL CHECK (category IN ('Mobiles','Electronics','Fashion','Beauty','Home')),
  affiliate_link text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reject_reason text,
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved products"
  ON public.products FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own products"
  ON public.products FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins full access on products"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 2. REFERRALS
-- ============================================================
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  commission_amount numeric NOT NULL DEFAULT 0,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Admins full access on referrals"
  ON public.referrals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 3. PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('platform_fee','withdrawal')),
  amount numeric NOT NULL,
  gateway_order_id text,
  gateway_payment_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins full access on payments"
  ON public.payments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 4. CLICKS
-- ============================================================
CREATE TABLE public.clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on clicks"
  ON public.clicks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can insert clicks"
  ON public.clicks FOR INSERT WITH CHECK (true);


-- ============================================================
-- 5. WITHDRAWAL REQUESTS
-- ============================================================
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  upi_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reject_reason text,
  processed_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals"
  ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals"
  ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access on withdrawals"
  ON public.withdrawal_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 6. PLATFORM CONFIG
-- ============================================================
CREATE TABLE public.platform_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'number' CHECK (type IN ('number','boolean','text','color')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config"
  ON public.platform_config FOR SELECT USING (true);

CREATE POLICY "Admins can update config"
  ON public.platform_config FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 7. SEED DEFAULT CONFIG VALUES
-- ============================================================
INSERT INTO public.platform_config (key, value, label, type) VALUES
  ('free_post_limit',             '10',      'Free Posts Per User',               'number'),
  ('platform_fee_amount',         '249',     'Platform Fee (₹)',                  'number'),
  ('referral_commission',         '100',     'Referral Commission (₹)',           'number'),
  ('min_withdrawal_amount',       '200',     'Minimum Withdrawal (₹)',            'number'),
  ('max_posts_per_day',           '5',       'Max Posts Per Day',                 'number'),
  ('new_posts_require_approval',  'true',    'Require Admin Approval for Posts',  'boolean'),
  ('hero_badge_text',             '🔥 Hot Deals Every Day', 'Hero Badge Text',   'text'),
  ('hero_headline',               'Find the Best Deals Online', 'Hero Headline', 'text'),
  ('hero_subtitle',               'Discover curated offers from Amazon, Flipkart, Myntra & Meesho — all in one place.', 'Hero Subtitle', 'text'),
  ('hero_stat_1_value',           '10K+',    'Hero Stat 1 Value',                 'text'),
  ('hero_stat_1_label',           'Active Deals', 'Hero Stat 1 Label',           'text'),
  ('hero_stat_2_value',           '500+',    'Hero Stat 2 Value',                 'text'),
  ('hero_stat_2_label',           'Verified Sellers', 'Hero Stat 2 Label',       'text'),
  ('hero_stat_3_value',           '₹2Cr+',   'Hero Stat 3 Value',                 'text'),
  ('hero_stat_3_label',           'Savings Generated', 'Hero Stat 3 Label',      'text'),
  ('site_hero_gradient_from',     '#6040d1', 'Hero Gradient Start Color',        'color'),
  ('site_hero_gradient_to',       '#9f2089', 'Hero Gradient End Color',          'color');


-- ============================================================
-- 8. TRIGGER: auto-increment users.post_count on product insert
-- ============================================================
CREATE OR REPLACE FUNCTION increment_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET post_count = post_count + 1 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_product_insert
  AFTER INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION increment_post_count();


-- ============================================================
-- 9. TRIGGER: auto-increment products.click_count on click insert
-- ============================================================
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products SET click_count = click_count + 1 WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_click_insert
  AFTER INSERT ON public.clicks
  FOR EACH ROW EXECUTE FUNCTION increment_click_count();
