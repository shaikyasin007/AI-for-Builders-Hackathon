-- Optional: run in Supabase SQL Editor to match the app template schema.
-- Your project may already use user_id + feedback + rating instead.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
