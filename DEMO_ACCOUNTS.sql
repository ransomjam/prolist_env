-- =============================================
-- DEMO ACCOUNTS SETUP
-- =============================================
-- 
-- STEP 1: Create users via Supabase Auth Dashboard or API
-- Go to Authentication > Users > Add User
-- 
-- Create these 4 users:
-- 
-- 1. Buyer Demo
--    Email: buyer@demo.com
--    Password: 123456
--
-- 2. Seller Demo  
--    Email: seller@demo.com
--    Password: 123456
--
-- 3. Agent Demo
--    Email: agent@demo.com
--    Password: 123456
--
-- 4. Admin Demo
--    Email: admin@demo.com
--    Password: 123456
--
-- STEP 2: Get the user IDs from the Auth > Users table
-- Then replace the placeholders below and run this SQL:
-- =============================================

-- Replace these with actual UUIDs from your auth.users table
-- You can find them in the Supabase Dashboard under Authentication > Users

DO $$
DECLARE
  buyer_id UUID;
  seller_id UUID;
  agent_id UUID;
  admin_id UUID;
BEGIN
  -- Get user IDs by email
  SELECT id INTO buyer_id FROM auth.users WHERE email = 'buyer@demo.com';
  SELECT id INTO seller_id FROM auth.users WHERE email = 'seller@demo.com';
  SELECT id INTO agent_id FROM auth.users WHERE email = 'agent@demo.com';
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@demo.com';

  -- Update profiles with proper names
  UPDATE public.profiles SET 
    name = 'Demo Buyer',
    phone = '+237 600 000 001',
    city = 'Bamenda'
  WHERE id = buyer_id;

  UPDATE public.profiles SET 
    name = 'Verified Seller',
    phone = '+237 600 000 002',
    city = 'Bamenda',
    verification_status = 'VERIFIED'
  WHERE id = seller_id;

  UPDATE public.profiles SET 
    name = 'Delivery Agent',
    phone = '+237 600 000 003',
    city = 'Bamenda'
  WHERE id = agent_id;

  UPDATE public.profiles SET 
    name = 'System Admin',
    phone = '+237 600 000 004',
    city = 'Bamenda',
    verification_status = 'VERIFIED'
  WHERE id = admin_id;

  -- Add additional roles (default BUYER role is auto-added by trigger)
  -- Add SELLER role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (seller_id, 'SELLER')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Add AGENT role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (agent_id, 'AGENT')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Add ADMIN role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (admin_id, 'ADMIN')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create sample posts for the seller
  INSERT INTO public.posts (seller_id, title, description, price, visibility, category, condition)
  VALUES 
    (seller_id, 'iPhone 13 Pro Max', 'Slightly used iPhone 13 Pro Max, 256GB, excellent condition. Comes with original charger and box.', 450000, 'PUBLIC', 'Electronics', 'Used - Like New'),
    (seller_id, 'Nike Air Jordan 1', 'Brand new Nike Air Jordan 1 Retro High OG. Size 43. Never worn.', 85000, 'PUBLIC', 'Fashion', 'New'),
    (seller_id, 'Samsung Galaxy Watch 5', 'Samsung Galaxy Watch 5, 44mm, Bluetooth. Perfect for fitness tracking.', 120000, 'PUBLIC', 'Electronics', 'Used - Good');

  -- Create a sample transaction in ESCROW_HELD status
  INSERT INTO public.transactions (
    buyer_id, 
    seller_id, 
    post_id, 
    amount, 
    status, 
    delivery_location,
    delivery_address,
    buyer_phone,
    escrow_held_at
  )
  SELECT 
    buyer_id,
    seller_id,
    (SELECT id FROM public.posts WHERE seller_id = seller_id LIMIT 1),
    450000,
    'ESCROW_HELD',
    'bamenda-city-chemist',
    'City Chemist Area, Bamenda',
    '+237 600 000 001',
    NOW()
  WHERE buyer_id IS NOT NULL AND seller_id IS NOT NULL;

  RAISE NOTICE 'Demo data setup complete!';
  RAISE NOTICE 'Buyer ID: %', buyer_id;
  RAISE NOTICE 'Seller ID: %', seller_id;
  RAISE NOTICE 'Agent ID: %', agent_id;
  RAISE NOTICE 'Admin ID: %', admin_id;
END $$;

-- Verify the setup
SELECT 
  p.name,
  p.email,
  p.verification_status,
  array_agg(ur.role) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.email LIKE '%@demo.com'
GROUP BY p.id, p.name, p.email, p.verification_status;
