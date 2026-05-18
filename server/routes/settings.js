const router = require('express').Router();
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');

// GET /api/settings/class_name — public, no auth required
router.get('/class_name', async (req, res) => {
  try {
    const { rows } = await db.query("SELECT value FROM settings WHERE key = 'class_name'");
    if (!rows.length) return res.status(404).json({ error: 'Setting not found' });
    res.json({ value: rows[0].value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/settings/class_name — admin only
router.put('/class_name', requireAuth, requireAdmin, async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'Value is required' });
  try {
    const { rows } = await db.query(
      "UPDATE settings SET value = $1 WHERE key = 'class_name' RETURNING value",
      [value]
    );
    if (!rows.length) return res.status(404).json({ error: 'Setting not found' });
    res.json({ value: rows[0].value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
