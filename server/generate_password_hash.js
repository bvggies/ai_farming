// Run this script to generate a bcrypt hash for a password
// Usage: node generate_password_hash.js password123

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('\nPassword:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nSQL INSERT example:');
  console.log(`INSERT INTO users (name, email, password, role, is_active) VALUES ('Test User', 'test@example.com', '${hash}', 'farmer', true);\n`);
});

