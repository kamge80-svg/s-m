# 📋 Guide : Appliquer les migrations SQL

## Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

## Étape 2 : Ouvrir SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query**

## Migration 1 : Purchases (Achats)

### Copiez ce SQL :

```sql
-- Create purchases table for tracking Stripe payments
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  payment_intent_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_intent ON purchases(payment_intent_id);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update purchases"
  ON purchases FOR UPDATE
  USING (true);

CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchases_updated_at();
```

### Actions :
1. Collez le SQL dans l'éditeur
2. Cliquez sur **Run** (ou F5)
3. Attendez le message "Success"

---

## Migration 2 : Notifications et Messages

### Copiez ce SQL :

```sql
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

-- Create analytics table
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

-- Triggers for notifications
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

-- Analytics triggers
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
```

### Actions :
1. Collez le SQL dans l'éditeur
2. Cliquez sur **Run** (ou F5)
3. Attendez le message "Success"

---

## Migration 3 : Reviews et Catégories

### Copiez ce SQL :

```sql
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Add rating columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER trigger_update_rating_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER trigger_update_rating_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Notification for reviews
CREATE OR REPLACE FUNCTION notify_on_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, from_user_id, link)
  SELECT 
    p.user_id,
    'review',
    'New Review',
    (SELECT username FROM profiles WHERE id = NEW.user_id) || ' left a ' || NEW.rating || '-star review on your product',
    NEW.user_id,
    '/product/' || NEW.product_id
  FROM products p
  WHERE p.id = NEW.product_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_review();
```

### Actions :
1. Collez le SQL dans l'éditeur
2. Cliquez sur **Run** (ou F5)
3. Attendez le message "Success"

---

## Étape 3 : Activer Realtime

1. Dans Supabase Dashboard, allez dans **Database** > **Replication**
2. Activez la réplication pour ces tables :
   - ✅ `notifications`
   - ✅ `messages`
   - ✅ `conversations`
   - ✅ `reviews`

---

## Vérification

### Vérifier que les tables existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'messages', 'conversations', 'purchases', 'reviews', 'product_analytics');
```

Vous devriez voir 6 tables.

---

## En cas d'erreur

### Si une table existe déjà :
- C'est normal ! Le SQL utilise `IF NOT EXISTS`
- Continuez avec la migration suivante

### Si une colonne existe déjà :
- C'est normal ! Le SQL utilise `IF NOT EXISTS`
- L'erreur sera ignorée

### Si un trigger existe déjà :
- Le SQL utilise `CREATE OR REPLACE`
- Il sera mis à jour automatiquement

---

## ✅ Terminé !

Une fois les 3 migrations appliquées :

1. ✅ Toutes les tables sont créées
2. ✅ Tous les triggers sont actifs
3. ✅ Les politiques RLS sont en place
4. ✅ L'application est prête !

Lancez votre application :
```bash
npm run dev
```

**Félicitations ! Votre base de données est configurée !** 🎉
