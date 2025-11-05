-- Minimal SQL schema for Vercel serverless + Neon (matching auth endpoints)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Additional tables (posts, images, likes, comments, knowledge, notifications)
-- can be added later when those routes are moved to serverless.


