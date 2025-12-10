const mysql = require('mysql2/promise');
let pool = null;

function initPool(config) {
  if (!pool) {
    pool = mysql.createPool({
      host: config.host || process.env.DB_HOST || 'localhost',
      user: config.user || process.env.DB_USER || 'root',
      password: config.password || process.env.DB_PASS || '',
      database: config.database || process.env.DB_NAME || 'swisys',
      waitForConnections: true,
      connectionLimit: config.connectionLimit || 10,
      queueLimit: 0,
    });
  }
  return pool;
}

function getPool() {
  if (!pool) {
    // Lazily initialize with env vars
    initPool({});
  }
  return pool;
}

module.exports = { initPool, getPool };
