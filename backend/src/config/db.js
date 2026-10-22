/**
 * Database Configuration & Connection Pool
 * Supports PostgreSQL connection pooling via 'pg' and an in-memory test store.
 */
const { Pool } = require('pg');

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

module.exports = {
  query: (text, params) => {
    if (pool) {
      return pool.query(text, params);
    }
    return null;
  },
  pool,
};
