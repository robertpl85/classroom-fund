const router = require('express').Router();
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');

router.use(requireAuth);

// GET /api/expenses
// Admin sees all; moms see only their own
router.get('/', async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `
        SELECT e.*,
          su.name AS submitted_by_name,
          au.name AS approved_by_name
        FROM expenses e
        LEFT JOIN users su ON e.submitted_by = su.id
        LEFT JOIN users au ON e.approved_by  = au.id
        ORDER BY e.date DESC, e.created_at DESC`;
      params = [];
    } else {
      query = `
        SELECT e.*,
          su.name AS submitted_by_name,
          au.name AS approved_by_name
        FROM expenses e
        LEFT JOIN users su ON e.submitted_by = su.id
        LEFT JOIN users au ON e.approved_by  = au.id
        WHERE e.submitted_by = $1
        ORDER BY e.date DESC, e.created_at DESC`;
      params = [req.user.id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/expenses — submit an expense
router.post('/', async (req, res) => {
  const { description, amount, category = 'General', date } = req.body;
  if (!description || !amount || !date)
    return res.status(400).json({ error: 'Description, amount, and date are required' });

  // Admins auto-approve their own expenses
  const status      = req.user.role === 'admin' ? 'approved' : 'pending';
  const approved_by = req.user.role === 'admin' ? req.user.id : null;

  try {
    const { rows } = await db.query(
      `INSERT INTO expenses (description, amount, category, date, submitted_by, status, approved_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [description, amount, category, date, req.user.id, status, approved_by]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/expenses/:id/approve (admin only)
router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE expenses SET status='approved', approved_by=$1
       WHERE id=$2 AND status='pending' RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Expense not found or already processed' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/expenses/:id/reject (admin only)
router.patch('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE expenses SET status='rejected'
       WHERE id=$2 AND status='pending' RETURNING *`,  // intentional: $2 only — no approved_by on reject
      [req.user.id, req.params.id]
    );
    // fix param count
    const { rows: r } = await db.query(
      `UPDATE expenses SET status='rejected'
       WHERE id=$1 AND status='pending' RETURNING *`,
      [req.params.id]
    );
    if (!r.length)
      return res.status(404).json({ error: 'Expense not found or already processed' });
    res.json(r[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/expenses/summary — balance info
router.get('/summary', async (req, res) => {
  try {
    const collected = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM students WHERE paid = true`
    );
    const spent = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE status = 'approved'`
    );
    const pending = await db.query(
      `SELECT COUNT(*) AS count FROM expenses WHERE status = 'pending'`
    );
    res.json({
      total_collected: parseFloat(collected.rows[0].total),
      total_spent:     parseFloat(spent.rows[0].total),
      balance:         parseFloat(collected.rows[0].total) - parseFloat(spent.rows[0].total),
      pending_count:   parseInt(pending.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
