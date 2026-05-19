const router = require('express').Router();
const { exec } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { requireAuth, requireAdmin } = require('../middleware');

const BACKUP_DIR = '/home/robert/backups';

router.use(requireAuth);
router.use(requireAdmin);

// GET /api/backup/list — list available backup files
router.get('/list', (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return res.json([]);
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('classroom_fund_') && f.endsWith('.sql'))
      .sort()
      .reverse()
      .map(filename => {
        const stats = fs.statSync(path.join(BACKUP_DIR, filename));
        return {
          filename,
          date:    filename.replace('classroom_fund_', '').replace('.sql', ''),
          size:    (stats.size / 1024).toFixed(1) + ' KB',
          created: stats.mtime,
        };
      });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// POST /api/backup/create — create a manual backup
router.post('/create', (req, res) => {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const date     = new Date().toISOString().split('T')[0];
  const time     = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `classroom_fund_${date}_${time}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const cmd = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} > ${filepath}`;

  exec(cmd, (err) => {
    if (err) {
      console.error('Backup failed:', err);
      return res.status(500).json({ error: 'Backup failed' });
    }
    res.json({ message: 'Backup created successfully', filename });
  });
});

// POST /api/backup/restore — restore the database from a backup file
router.post('/restore', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename required' });

  // Prevent path traversal
  if (filename.includes('/') || filename.includes('..') || !filename.endsWith('.sql')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Backup file not found' });
  }

  const restoreCmd = `
    PGPASSWORD=${process.env.DB_PASSWORD} psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} -c "
      TRUNCATE TABLE expenses, students, settings, users, audit_log RESTART IDENTITY CASCADE;
    " && PGPASSWORD=${process.env.DB_PASSWORD} psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} < ${filepath}
  `;

  exec(restoreCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Restore failed:', err);
      console.error('stderr:', stderr);
      return res.status(500).json({ error: 'Restore failed: ' + stderr });
    }
    res.json({ message: 'Database restored successfully' });
  });
});

module.exports = router;
