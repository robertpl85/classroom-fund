require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Security Headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,   // disable CSP — would break the React app
  crossOriginEmbedderPolicy: false,
}));

// ── Rate Limiters ─────────────────────────────────────────────
// Login rate limiting is handled per-email inside routes/auth.js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
});

// General API rate limiter (login rate limiting is handled per-email in routes/auth.js)
app.use('/api', apiLimiter);

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(require('./middleware/sanitize'));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/admin',    require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve React build in production ───────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
