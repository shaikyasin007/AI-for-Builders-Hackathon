-- Run in Supabase SQL Editor if you want structured AI suggestions (optional)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;
