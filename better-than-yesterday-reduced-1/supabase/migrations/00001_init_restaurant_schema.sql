
-- Enable pgcrypto if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Restaurant Settings table
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id text PRIMARY KEY DEFAULT 'main',
  restaurant_name text NOT NULL DEFAULT 'Oops! Life Cooked Again',
  tagline text NOT NULL DEFAULT 'Life cooked you. So we cooked for you.',
  subtagline text NOT NULL DEFAULT 'Life cooked you. Our menu heals you.',
  phone text NOT NULL DEFAULT '+91 7010847158',
  email text NOT NULL DEFAULT 'oopslifecookedagain@gmail.com',
  address text NOT NULL DEFAULT '2nd Bsc CS, St.Joseph''s College(Autonomous) Trichy-620002',
  opening_hours jsonb NOT NULL DEFAULT '[
    {"day": "Monday", "timing": "06:00 AM - 10:00 PM", "isOpen": true},
    {"day": "Tuesday", "timing": "06:00 AM - 10:00 PM", "isOpen": true},
    {"day": "Wednesday", "timing": "06:00 AM - 10:00 PM", "isOpen": true},
    {"day": "Thursday", "timing": "06:00 AM - 10:00 PM", "isOpen": true},
    {"day": "Friday", "timing": "06:00 AM - 10:00 PM", "isOpen": true},
    {"day": "Saturday", "timing": "Holiday", "isOpen": false},
    {"day": "Sunday", "timing": "06:00 AM - 10:00 PM", "isOpen": true}
  ]'::jsonb,
  about_text text NOT NULL DEFAULT '"Oops! Life Cooked Again" is a friends-owned restaurant where great food meets great friendships. We''re just a bunch of friends who love food and decided to turn our endless cravings into a restaurant. A few days ago, Oops! Life Cooked Again was born with one goal—to serve tasty food, share good vibes, and create happy memories. We cook food better than your life.',
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO public.restaurant_settings (id) 
VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- 2. Menu Items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL, -- 'Breakfast Specials', 'Lunch Combos', 'Dinner Delights', 'Desserts & Beverages'
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT '₹',
  description text,
  image_url text,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  dietary text DEFAULT 'Veg', -- 'Veg', 'Non-Veg', 'Beverage', 'Dessert'
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  guest_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  reservation_date date NOT NULL,
  reservation_time text NOT NULL,
  guests_count integer NOT NULL DEFAULT 2,
  seating_preference text NOT NULL DEFAULT 'indoor', -- 'indoor', 'outdoor', 'no_preference'
  additional_notes text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- 4. Feedback & Reviews table
CREATE TABLE IF NOT EXISTS public.feedback_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_feedback text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. Online Orders table
CREATE TABLE IF NOT EXISTS public.online_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  order_type text NOT NULL DEFAULT 'pickup', -- 'pickup', 'dine_in'
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'received', -- 'received', 'preparing', 'ready', 'completed', 'cancelled'
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_orders ENABLE ROW LEVEL SECURITY;

-- restaurant_settings: Everyone can read; authenticated / anon can read, anyone with staff role or public update for demo
CREATE POLICY "Public read restaurant_settings" ON public.restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Public insert restaurant_settings" ON public.restaurant_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update restaurant_settings" ON public.restaurant_settings FOR UPDATE USING (true) WITH CHECK (true);

-- menu_items: Public can select; insert/update/delete enabled for management
CREATE POLICY "Public read menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Public insert menu_items" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update menu_items" ON public.menu_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete menu_items" ON public.menu_items FOR DELETE USING (true);

-- reservations: Anyone can insert reservations, view their own or all for management
CREATE POLICY "Public insert reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Public update reservations" ON public.reservations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete reservations" ON public.reservations FOR DELETE USING (true);

-- feedback_reviews: Anyone can insert feedback, public can view approved feedback or all
CREATE POLICY "Public insert feedback" ON public.feedback_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read feedback" ON public.feedback_reviews FOR SELECT USING (true);
CREATE POLICY "Public update feedback" ON public.feedback_reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete feedback" ON public.feedback_reviews FOR DELETE USING (true);

-- online_orders: Anyone can insert and view orders
CREATE POLICY "Public insert online_orders" ON public.online_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read online_orders" ON public.online_orders FOR SELECT USING (true);
CREATE POLICY "Public update online_orders" ON public.online_orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete online_orders" ON public.online_orders FOR DELETE USING (true);
