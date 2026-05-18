const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');

// All routes require auth
router.use(requireAuth);

// GET /api/users — list all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY role DESC, name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users — create a new account (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { name, email, password, role = 'mom' } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email.toLowerCase(), hashed, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') // unique violation
      return res.status(409).json({ error: 'Email already in use' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/:id/password — reset password (admin only)
router.patch('/:id/password', requireAdmin, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const { rowCount } = await db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashed, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id — remove account (admin only, cannot delete self)
router.delete('/:id', requireAdmin, async (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete your own account' });
  try {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
