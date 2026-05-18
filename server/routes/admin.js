const router = require('express').Router();
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');

// POST /api/admin/reset — wipe students + expenses, update class name (admin only)
router.post('/reset', requireAuth, requireAdmin, async (req, res) => {
  const { class_name } = req.body;
  if (!class_name) return res.status(400).json({ error: 'class_name is required' });
  try {
    await db.query('DELETE FROM expenses');
    await db.query('DELETE FROM students');
    await db.query("UPDATE settings SET value = $1 WHERE key = 'class_name'", [class_name]);
    res.json({ message: 'Reset complete', class_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
