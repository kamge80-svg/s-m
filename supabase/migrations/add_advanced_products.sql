-- Phase 1: Advanced Product Management

-- Add stock management to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS unlimited_stock BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50) DEFAULT 'video';

-- Bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle items (products in bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bundle_id, product_id)
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  discount_percentage INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (product_id IS NOT NULL OR bundle_id IS NOT NULL)
);

-- RLS Policies for bundles
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundles are viewable by everyone"
  ON bundles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own bundles"
  ON bundles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bundles"
  ON bundles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bundles"
  ON bundles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bundle_items
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundle items are viewable by everyone"
  ON bundle_items FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their bundle items"
  ON bundle_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bundles
      WHERE bundles.id = bundle_items.bundle_id
      AND bundles.user_id = auth.uid()
    )
  );

-- RLS Policies for promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promo codes are viewable by everyone"
  ON promo_codes FOR SELECT
  USING (active = true);

CREATE POLICY "Users can create their own promo codes"
  ON promo_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own promo codes"
  ON promo_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own promo codes"
  ON promo_codes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotions are viewable by everyone"
  ON promotions FOR SELECT
  USING (active = true AND NOW() BETWEEN start_date AND end_date);

CREATE POLICY "Users can manage promotions for their products"
  ON promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = promotions.product_id
      AND products.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM bundles
      WHERE bundles.id = promotions.bundle_id
      AND bundles.user_id = auth.uid()
    )
  );

-- Function to check and decrement stock
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
  is_unlimited BOOLEAN;
BEGIN
  SELECT stock_quantity, unlimited_stock
  INTO current_stock, is_unlimited
  FROM products
  WHERE id = product_id_param;

  IF is_unlimited THEN
    RETURN true;
  END IF;

  IF current_stock IS NULL OR current_stock <= 0 THEN
    RETURN false;
  END IF;

  UPDATE products
  SET stock_quantity = stock_quantity - 1
  WHERE id = product_id_param;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(code_param VARCHAR, amount_param DECIMAL)
RETURNS TABLE(valid BOOLEAN, discount DECIMAL, message TEXT) AS $$
DECLARE
  promo RECORD;
  calculated_discount DECIMAL;
BEGIN
  SELECT * INTO promo
  FROM promo_codes
  WHERE code = code_param
  AND active = true
  AND (valid_until IS NULL OR valid_until > NOW())
  AND (max_uses IS NULL OR uses_count < max_uses)
  AND amount_param >= min_purchase;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Invalid or expired promo code'::TEXT;
    RETURN;
  END IF;

  IF promo.discount_type = 'percentage' THEN
    calculated_discount := amount_param * (promo.discount_value / 100);
  ELSE
    calculated_discount := promo.discount_value;
  END IF;

  RETURN QUERY SELECT true, calculated_discount, 'Promo code applied'::TEXT;
END;
$$ LANGUAGE plpgsql;
