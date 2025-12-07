-- Email queue table for reliable email delivery
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);

-- RLS policies
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Only admins can view email queue
CREATE POLICY "Admins can view email queue"
ON email_queue FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = TRUE
  )
);

-- System can insert emails
CREATE POLICY "System can insert emails"
ON email_queue FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE email_queue IS 'Queue for transactional emails with retry mechanism';
