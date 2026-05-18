const router = require('express').Router();
const db     = require('../db');
const { requireAuth, requireAdmin } = require('../middleware');

router.use(requireAuth);

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM students ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/students (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { name, parent_email, parent_phone, paid = false, amount = 0 } = req.body;
  if (!name || !parent_email)
    return res.status(400).json({ error: 'Name and parent email are required' });

  try {
    const { rows } = await db.query(
      `INSERT INTO students (name, parent_email, parent_phone, paid, amount)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, parent_email, parent_phone, paid, paid ? amount : 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/students/:id (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, parent_email, parent_phone, paid, amount } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE students SET name=$1, parent_email=$2, parent_phone=$3, paid=$4, amount=$5
       WHERE id=$6 RETURNING *`,
      [name, parent_email, parent_phone, paid, paid ? amount : 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/students/:id/paid — quick toggle paid status (admin only)
router.patch('/:id/paid', requireAdmin, async (req, res) => {
  const { paid, amount } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE students SET paid=$1, amount=$2 WHERE id=$3 RETURNING *`,
      [paid, paid ? (amount ?? 40) : 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/students/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM students WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
