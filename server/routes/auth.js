const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const { requireAuth } = require('../middleware');
const { logAction }   = require('../middleware/audit');

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

    // Unknown email — don't reveal whether the account exists
    if (!user) {
      logAction(null, 'FAILED_LOGIN', email, req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
      return res.status(429).json({
        error: `Account is temporarily locked. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      // Increment failed_attempts; lock the account when it hits 3
      const newCount = (user.failed_attempts || 0) + 1;
      const lockedUntil = newCount >= 3 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await db.query(
        'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
        [newCount, lockedUntil, user.id]
      );

      logAction(null, 'FAILED_LOGIN', email, req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Successful login — clear lockout state
    await db.query(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1',
      [user.id]
    );

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
