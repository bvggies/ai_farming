-- Set default role to worker for new users (Neon users table uses text role)
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'worker';
