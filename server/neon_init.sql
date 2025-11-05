-- Minimal SQL schema for Vercel serverless + Neon (matching auth endpoints)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  password      text NOT NULL,
  farm_size     text DEFAULT '',
  poultry_type  text DEFAULT '',
  preferred_language text DEFAULT 'en',
  role          text NOT NULL DEFAULT 'farmer',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Additional tables (posts, images, likes, comments, knowledge, notifications)
-- can be added later when those routes are moved to serverless.


