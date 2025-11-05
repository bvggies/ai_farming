const { neon } = require('@neondatabase/serverless');

function getSql() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(DATABASE_URL);
}

module.exports = { getSql };


