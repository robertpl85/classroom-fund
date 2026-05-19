const db = require('../db');

async function logAction(userId, action, details, ipAddress) {
  try {
    await db.query(
      'INSERT INTO audit_log (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, action, details, ipAddress]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

module.exports = { logAction };
