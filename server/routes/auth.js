const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');
const { logAction } = require('../middleware/audit');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1', [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user) {
      logAction(null, 'FAILED_LOGIN', email, req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logAction(null, 'FAILED_LOGIN', email, req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logAction(user.id, 'LOGIN', 'Successful login', req.ip);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me  — verify token and return current user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
