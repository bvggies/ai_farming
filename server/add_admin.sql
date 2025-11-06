-- SQL to create an admin user in Neon SQL Editor
-- Password: admin123 (change this after first login!)

-- Option 1: Insert new admin user (if email doesn't exist)
INSERT INTO users (
  name, 
  email, 
  password, 
  farm_size, 
  poultry_type, 
  preferred_language, 
  role, 
  is_active
) VALUES (
  'Admin User',
  'admin@appahfarms.com',
  '$2a$10$YOUR_PASSWORD_HASH_HERE', -- Replace with hash from generate_password_hash.js
  '',
  '',
  'en',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Option 2: Update existing user to admin (if user already exists)
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify admin was created:
SELECT id, name, email, role, is_active, created_at 
FROM users 
WHERE role = 'admin';

