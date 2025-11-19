-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'purchase', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create purchase_history view
CREATE OR REPLACE VIEW purchase_history AS
SELECT 
  p.*,
  prod.title as product_title,
  prod.media_url as product_media_url,
  prod.thumbnail_url as product_thumbnail_url,
  seller.username as seller_username,
  seller.avatar_url as seller_avatar_url
FROM purchases p
LEFT JOIN products prod ON p.product_id = prod.id
LEFT JOIN profiles seller ON prod.user_id = seller.id;

-- Create analytics table for tracking
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(product_id, date)
);

CREATE INDEX idx_analytics_product ON product_analytics(product_id);
CREATE INDEX idx_analytics_date ON product_analytics(date DESC);

ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product analytics"
  ON product_analytics FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE user_id = auth.uid()
    )
  );

-- Function to create notification on follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, from_user_id, link)
  SELECT 
    NEW.following_id,
    'follow',
    'New Follower',
    (SELECT username FROM profiles WHERE id = NEW.follower_id) || ' started following you',
    NEW.follower_id,
    '/profile/' || NEW.follower_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Function to create notification on like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, from_user_id, link)
  SELECT 
    p.user_id,
    'like',
    'New Like',
    (SELECT username FROM profiles WHERE id = NEW.user_id) || ' liked your product',
    NEW.user_id,
    '/product/' || NEW.product_id
  FROM products p
  WHERE p.id = NEW.product_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- Function to create notification on purchase
CREATE OR REPLACE FUNCTION notify_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, from_user_id, link)
  SELECT 
    p.user_id,
    'purchase',
    'New Sale! 🎉',
    (SELECT username FROM profiles WHERE id = NEW.user_id) || ' purchased your product for $' || NEW.amount,
    NEW.user_id,
    '/product/' || NEW.product_id
  FROM products p
  WHERE p.id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_purchase
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_purchase();

-- Function to update analytics
CREATE OR REPLACE FUNCTION update_product_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'likes' THEN
    INSERT INTO product_analytics (product_id, date, likes)
    VALUES (NEW.product_id, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET likes = product_analytics.likes + 1;
  ELSIF TG_TABLE_NAME = 'purchases' THEN
    INSERT INTO product_analytics (product_id, date, purchases, revenue)
    VALUES (NEW.product_id, CURRENT_DATE, 1, NEW.amount)
    ON CONFLICT (product_id, date)
    DO UPDATE SET 
      purchases = product_analytics.purchases + 1,
      revenue = product_analytics.revenue + NEW.amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analytics_likes
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_product_analytics();

CREATE TRIGGER trigger_analytics_purchases
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_product_analytics();
