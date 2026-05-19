const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:                    process.env.DB_HOST,
  port:                    process.env.DB_PORT,
  database:                process.env.DB_NAME,
  user:                    process.env.DB_USER,
  password:                process.env.DB_PASSWORD,
  max:                     10,    // max 10 connections in pool
  min:                     2,     // keep 2 idle connections warm
  idleTimeoutMillis:       30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000,  // throw if can't connect within 2s
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
