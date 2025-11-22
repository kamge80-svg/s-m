-- Add platform commission tracking to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 7.00;

-- Add comment
COMMENT ON COLUMN purchases.platform_fee IS 'Platform commission (7% by default)';
COMMENT ON COLUMN purchases.seller_amount IS 'Amount paid to seller (93% by default)';
COMMENT ON COLUMN purchases.commission_rate IS 'Commission rate percentage';

-- Create platform_earnings table to track total platform revenue
CREATE TABLE IF NOT EXISTS platform_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sales DECIMAL(10, 2) DEFAULT 0,
  total_commission DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE platform_earnings ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform earnings (for now, no one can access)
CREATE POLICY "Platform earnings are private"
  ON platform_earnings
  FOR SELECT
  USING (false);

-- Function to update platform earnings
CREATE OR REPLACE FUNCTION update_platform_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily earnings
  INSERT INTO platform_earnings (date, total_sales, total_commission, transaction_count)
  VALUES (
    CURRENT_DATE,
    NEW.amount,
    NEW.platform_fee,
    1
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_sales = platform_earnings.total_sales + NEW.amount,
    total_commission = platform_earnings.total_commission + NEW.platform_fee,
    transaction_count = platform_earnings.transaction_count + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update platform earnings on purchase
CREATE TRIGGER update_platform_earnings_trigger
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_earnings();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_platform_earnings_date ON platform_earnings(date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_platform_fee ON purchases(platform_fee);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_amount ON purchases(seller_amount);
