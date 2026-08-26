-- ============================================================
-- ADMIN HELPER QUERIES
-- Useful one-off queries to run in Supabase SQL Editor
-- ============================================================

-- Make a user an admin (replace with your actual email)
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';

-- ============================================================
-- View all pending products
-- ============================================================
SELECT id, title, store, offer_price, created_at
FROM public.products
WHERE status = 'pending'
ORDER BY created_at DESC;

-- ============================================================
-- Approve a product
-- ============================================================
-- UPDATE public.products SET status = 'approved', reviewed_at = now() WHERE id = '<product-uuid>';

-- ============================================================
-- Reject a product with a reason
-- ============================================================
-- UPDATE public.products
-- SET status = 'rejected', reject_reason = 'Reason here', reviewed_at = now()
-- WHERE id = '<product-uuid>';

-- ============================================================
-- View all withdrawal requests
-- ============================================================
SELECT wr.id, u.email, u.name, wr.amount, wr.upi_id, wr.status, wr.created_at
FROM public.withdrawal_requests wr
JOIN public.users u ON u.id = wr.user_id
ORDER BY wr.created_at DESC;

-- ============================================================
-- Approve a withdrawal & deduct wallet balance
-- ============================================================
-- BEGIN;
--   UPDATE public.withdrawal_requests
--     SET status = 'approved', processed_at = now()
--     WHERE id = '<withdrawal-uuid>';
--   UPDATE public.users
--     SET wallet_balance = wallet_balance - <amount>
--     WHERE id = '<user-uuid>';
-- COMMIT;

-- ============================================================
-- Credit referral commission to a user
-- ============================================================
-- UPDATE public.users SET wallet_balance = wallet_balance + 100 WHERE id = '<referrer-uuid>';
-- UPDATE public.referrals SET status = 'paid', paid_at = now() WHERE id = '<referral-uuid>';

-- ============================================================
-- Ban a user
-- ============================================================
-- UPDATE public.users SET is_banned = true, ban_reason = 'Reason here' WHERE id = '<user-uuid>';

-- ============================================================
-- View platform config
-- ============================================================
SELECT key, value, label, type, updated_at FROM public.platform_config ORDER BY key;

-- ============================================================
-- Update a config value manually
-- ============================================================
-- UPDATE public.platform_config SET value = '5', updated_at = now() WHERE key = 'max_posts_per_day';

-- ============================================================
-- View all contact messages (admin)
-- ============================================================
SELECT id, name, email, subject, status, created_at
FROM public.contact_messages
ORDER BY created_at DESC;
