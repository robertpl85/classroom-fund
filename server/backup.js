require('dotenv').config();
const { exec } = require('child_process');
const path     = require('path');
const fs       = require('fs');

const BACKUP_DIR  = '/home/robert/backups';
const MAX_BACKUPS = 7;

function runBackup() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const date     = new Date().toISOString().split('T')[0];
  const filename = `classroom_fund_${date}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const cmd = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump --clean --if-exists -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} > ${filepath}`;

  exec(cmd, (err) => {
    if (err) { console.error('Backup failed:', err); return; }
    console.log(`Backup created: ${filename}`);

    // Keep only the most recent MAX_BACKUPS files
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('classroom_fund_'))
      .sort();

    while (files.length > MAX_BACKUPS) {
      const oldest = files.shift();
      fs.unlinkSync(path.join(BACKUP_DIR, oldest));
      console.log(`Deleted old backup: ${oldest}`);
    }
  });
}

module.exports = { runBackup };
