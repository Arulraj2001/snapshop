-- ============================================================
-- MIGRATION 004 — Wallet Balance RPC (atomic increment)
-- Optional: use this function for safe concurrent wallet credits
-- ============================================================

-- This function safely increments wallet_balance using an atomic update.
-- Useful if you want to use RPC instead of read-then-write from server code.
CREATE OR REPLACE FUNCTION credit_wallet(target_user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET wallet_balance = wallet_balance + amount
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REFERRAL COMMISSION — How it works
-- ============================================================
-- When a new user (referred_id) pays the platform fee (₹249):
--   1. /api/payments/verify calls creditReferralIfEligible(referred_id)
--   2. It finds: referrals WHERE referred_id = ? AND status = 'pending'
--   3. Updates: referrals SET status='paid', commission_amount=<config>, paid_at=now()
--   4. Updates: users SET wallet_balance = wallet_balance + commission WHERE id = referrer_id
-- The same logic runs in /api/payments/webhook as a safety net.
-- Both are idempotent: they check status != 'paid' before crediting.

-- ============================================================
-- VIEW: referral_summary (optional, for admin dashboards)
-- ============================================================
CREATE OR REPLACE VIEW public.referral_summary AS
SELECT
  r.id,
  r.status,
  r.commission_amount,
  r.paid_at,
  r.created_at,
  referrer.email AS referrer_email,
  referrer.name  AS referrer_name,
  referred.email AS referred_email,
  referred.has_paid_platform_fee AS referred_paid
FROM public.referrals r
JOIN public.users referrer ON referrer.id = r.referrer_id
JOIN public.users referred ON referred.id = r.referred_id;

-- Grant admin read access to the view
-- (Admins use serviceClient which bypasses RLS, so this is informational)
