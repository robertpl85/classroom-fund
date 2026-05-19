const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');
const { logAction } = require('../middleware/audit');

// ── Per-email rate limiting ───────────────────────────────────
const loginAttempts = new Map();

function checkRateLimit(email) {
  const now        = Date.now();
  const windowMs   = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  if (!loginAttempts.has(email)) {
    loginAttempts.set(email, { count: 1, resetTime: now + windowMs });
    return null;
  }

  const record = loginAttempts.get(email);

  if (now > record.resetTime) {
    loginAttempts.set(email, { count: 1, resetTime: now + windowMs });
    return null;
  }

  record.count++;

  if (record.count > maxAttempts) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return `Too many login attempts. Please try again in ${minutesLeft} minutes.`;
  }

  return null;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const rateLimitError = checkRateLimit(email.toLowerCase());
  if (rateLimitError) return res.status(429).json({ error: rateLimitError });

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

    loginAttempts.delete(email.toLowerCase());
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
