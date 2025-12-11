-- =============================================
-- PROLIST PROTECT - COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. CREATE ENUM TYPES
-- =============================================

-- User roles enum
CREATE TYPE public.user_role AS ENUM ('BUYER', 'SELLER', 'AGENT', 'ADMIN');

-- Transaction status enum
CREATE TYPE public.transaction_status AS ENUM (
  'PENDING_PAYMENT',
  'ESCROW_HELD',
  'IN_TRANSIT_TO_HUB',
  'AT_PROLIST_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED_AWAITING_CONFIRMATION',
  'COMPLETED',
  'REFUNDED',
  'CANCELLED'
);

-- Verification status enum
CREATE TYPE public.verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- Post visibility enum
CREATE TYPE public.post_visibility AS ENUM ('PUBLIC', 'PRIVATE');

-- Verification file type enum
CREATE TYPE public.verification_file_type AS ENUM ('id_card', 'selfie');

-- 2. CREATE TABLES
-- =============================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  verification_status verification_status DEFAULT 'UNVERIFIED',
  pin_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'BUYER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  visibility post_visibility DEFAULT 'PUBLIC',
  category TEXT,
  condition TEXT,
  caption_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  status transaction_status DEFAULT 'PENDING_PAYMENT',
  delivery_location TEXT,
  delivery_address TEXT,
  buyer_phone TEXT,
  assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  escrow_held_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification files table
CREATE TABLE public.verification_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type verification_file_type NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery logs table
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  status transaction_status,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  referred_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE INDEXES
-- =============================================

CREATE INDEX idx_posts_seller_id ON public.posts(seller_id);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_transactions_agent_id ON public.transactions(assigned_agent_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. CREATE SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'ADMIN' THEN 1 
      WHEN 'AGENT' THEN 2 
      WHEN 'SELLER' THEN 3 
      ELSE 4 
    END
  LIMIT 1
$$;

-- Function to check if user is verified seller
CREATE OR REPLACE FUNCTION public.is_verified_seller(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE p.id = _user_id
      AND p.verification_status = 'VERIFIED'
      AND ur.role = 'SELLER'
  )
$$;

-- 6. CREATE RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can insert own initial role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Anyone can view public posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (visibility = 'PUBLIC' OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Verified sellers can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid() AND 
    (public.is_verified_seller(auth.uid()) OR public.has_role(auth.uid(), 'ADMIN'))
  );

CREATE POLICY "Sellers can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Sellers can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'));

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid() OR 
    assigned_agent_id = auth.uid() OR
    public.has_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Buyers can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Transaction update policy with strict workflow
CREATE POLICY "Controlled transaction updates"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    -- Seller can update from ESCROW_HELD to IN_TRANSIT_TO_HUB
    (seller_id = auth.uid() AND status = 'ESCROW_HELD') OR
    -- Admin can update hub statuses
    (public.has_role(auth.uid(), 'ADMIN') AND status IN ('IN_TRANSIT_TO_HUB', 'AT_PROLIST_HUB')) OR
    -- Agent can update from OUT_FOR_DELIVERY to DELIVERED_AWAITING_CONFIRMATION
    (assigned_agent_id = auth.uid() AND status = 'OUT_FOR_DELIVERY') OR
    -- Buyer can confirm delivery
    (buyer_id = auth.uid() AND status = 'DELIVERED_AWAITING_CONFIRMATION') OR
    -- Admin can update any
    public.has_role(auth.uid(), 'ADMIN')
  );

-- Verification files policies
CREATE POLICY "Users can view own verification files"
  ON public.verification_files FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can upload verification files"
  ON public.verification_files FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Delivery logs policies
CREATE POLICY "Agents and admins can view delivery logs"
  ON public.delivery_logs FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid() OR 
    public.has_role(auth.uid(), 'ADMIN') OR
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id 
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Agents can create delivery logs"
  ON public.delivery_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id = auth.uid() OR 
    public.has_role(auth.uid(), 'ADMIN')
  );

-- Referrals policies
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own referral code"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. CREATE TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  
  -- Default role is BUYER
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'BUYER');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. CREATE STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('posts', 'posts', true),
  ('avatars', 'avatars', true),
  ('verification', 'verification', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for posts bucket
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'posts');

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Storage policies for verification bucket (private)
CREATE POLICY "Users can view own verification files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload verification files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all verification files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'verification' AND public.has_role(auth.uid(), 'ADMIN'));

-- 9. SEED DEMO DATA
-- =============================================

-- Note: Demo accounts need to be created via Supabase Auth API or Dashboard
-- After creating users in Auth, run this to set their roles:

-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('<buyer_user_id>', 'BUYER'),
--   ('<seller_user_id>', 'SELLER'),
--   ('<agent_user_id>', 'AGENT'),
--   ('<admin_user_id>', 'ADMIN');

-- UPDATE public.profiles SET verification_status = 'VERIFIED' WHERE id = '<seller_user_id>';

-- =============================================
-- END OF SCHEMA
-- =============================================
