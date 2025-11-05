-- Use this SQL in Neon SQL Editor
-- First, delete the old test user if it exists:
DELETE FROM users WHERE email = 'farmer@example.com';

-- Then insert with the correct password hash:
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
  'Test Farmer',
  'farmer@example.com',
  '$2a$10$kFqP86HtkzcSWB1PREXmqecoN.EWK7tqKyUZ/AM6KFYgyyMt9SKgi', -- password123
  'Small (50-200 birds)',
  'Layers',
  'en',
  'farmer',
  true
);

-- Verify the user was created correctly:
SELECT id, name, email, role, is_active, 
       CASE WHEN password LIKE '$2a$%' THEN 'Hashed ✓' ELSE 'Not hashed ✗' END as password_status
FROM users WHERE email = 'farmer@example.com';

