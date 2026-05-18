# Classroom Fund Manager — Complete Linode Deployment Guide

## What You'll End Up With
- Your app running at `https://yourdomain.com`
- PostgreSQL database on the same server
- Auto-restart if the server reboots
- Free HTTPS via Let's Encrypt
- Estimated monthly cost: **$5/month** (Linode Nanode)

---

## PART 1 — Create Your Linode Server

1. Go to https://cloud.linode.com and sign in (or create a free account)
2. Click **"Create Linode"**
3. Choose these settings:
   - **Distribution:** Ubuntu 24.04 LTS
   - **Region:** Chicago (or closest to you)
   - **Linode Plan:** Shared CPU → Nanode 1GB → **$5/month**
   - **Linode Label:** `classroom-fund`
   - **Root Password:** Create a strong password and save it somewhere safe
4. Click **"Create Linode"** and wait ~60 seconds for it to boot
5. Note your server's **IP address** (shown on the dashboard, e.g. `172.105.123.45`)

---

## PART 2 — Point Your Domain to the Server

In your domain registrar (GoDaddy, Namecheap, etc.):

1. Find your domain's **DNS settings**
2. Add or update these records:
   ```
   Type: A    Name: @              Value: YOUR_SERVER_IP
   Type: A    Name: www            Value: YOUR_SERVER_IP
   ```
3. DNS changes take 5–30 minutes to spread worldwide

---

## PART 3 — First Server Login & Security Setup

Open Terminal (Mac/Linux) or PowerShell (Windows) and connect:

```bash
ssh root@YOUR_SERVER_IP
```

Type `yes` when asked about fingerprint, then enter your root password.

### Update the server
```bash
apt update && apt upgrade -y
```

### Create a non-root user (safer than using root)
```bash
adduser sarah
# Enter a password and press Enter for all other prompts

usermod -aG sudo sarah
```

### Set up SSH key login (optional but recommended)
If you want to skip typing a password every time you log in, run this
**on your LOCAL computer** (not the server) in a new terminal window:
```bash
ssh-copy-id sarah@YOUR_SERVER_IP
```

### Switch to your new user
```bash
su - sarah
```

---

## PART 4 — Install Required Software

### Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # should show v20.x.x
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (keeps Node running)
```bash
sudo npm install -g pm2
```

### Install Git
```bash
sudo apt install -y git
```

---

## PART 5 — Set Up the Database

### Create the database and user
```bash
sudo -u postgres psql
```

You're now inside PostgreSQL. Run these commands one by one
(replace `your_strong_password_here` with a real password — write it down!):

```sql
CREATE DATABASE classroom_fund;
CREATE USER classroom_user WITH ENCRYPTED PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE classroom_fund TO classroom_user;
\q
```

---

## PART 6 — Upload and Configure the App

### Create the app directory
```bash
sudo mkdir -p /var/www/classroom-fund
sudo chown sarah:sarah /var/www/classroom-fund
mkdir -p /home/sarah/app/logs
```

### Upload your project files

**Option A — Using SCP from your local computer** (run on YOUR computer):
```bash
scp -r /path/to/classroom-fund sarah@YOUR_SERVER_IP:/home/sarah/app
```

**Option B — Using Git** (if you put the code on GitHub):
```bash
cd /home/sarah
git clone https://github.com/YOURUSERNAME/classroom-fund.git app
```

### Install backend dependencies
```bash
cd /home/sarah/app/server
npm install --production
```

### Create the environment file
```bash
cp /home/sarah/app/server/.env.example /home/sarah/app/server/.env
nano /home/sarah/app/server/.env
```

Edit these values (Ctrl+O to save, Ctrl+X to exit nano):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=classroom_fund
DB_USER=classroom_user
DB_PASSWORD=your_strong_password_here    ← the one you created above

JWT_SECRET=    ← paste output of: openssl rand -hex 32

PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com        ← your real domain
```

**Generate a JWT secret** (run this, then paste the output into .env):
```bash
openssl rand -hex 32
```

### Load the database schema and seed data
```bash
psql -U classroom_user -d classroom_fund -h localhost -f /home/sarah/app/server/schema.sql
# Enter your database password when prompted
```

---

## PART 7 — Build the React Frontend

### Install frontend dependencies and build
```bash
cd /home/sarah/app/client
npm install
npm run build
```

This creates a `build/` folder with the compiled React app.

### Copy the build to Nginx's web directory
```bash
cp -r /home/sarah/app/client/build/* /var/www/classroom-fund/
```

---

## PART 8 — Configure Nginx

### Copy the Nginx config
```bash
sudo cp /home/sarah/app/nginx-classroom-fund.conf /etc/nginx/sites-available/classroom-fund
```

### Edit it to use your real domain
```bash
sudo nano /etc/nginx/sites-available/classroom-fund
```

Replace every instance of `yourdomain.com` with your actual domain.
Save with Ctrl+O, exit with Ctrl+X.

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/classroom-fund /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default    # remove default placeholder page
sudo nginx -t                                   # test for errors — should say "ok"
sudo systemctl reload nginx
```

---

## PART 9 — Set Up HTTPS (Free SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email address
- Type `Y` to agree to terms
- Type `N` for the marketing emails (optional)
- Choose option **2** to redirect HTTP to HTTPS

Certbot auto-renews certificates. Test renewal works:
```bash
sudo certbot renew --dry-run
```

---

## PART 10 — Start the Backend with PM2

```bash
cd /home/sarah/app
pm2 start ecosystem.config.js --env production
pm2 save                          # save so it restarts after reboot
pm2 startup                       # follow the instructions it prints
```

### Check it's running
```bash
pm2 status
pm2 logs classroom-fund-api       # watch live logs (Ctrl+C to exit)
```

---

## PART 11 — Open the Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
# Type "y" to confirm
sudo ufw status
```

---

## PART 12 — Test Everything

1. Open your browser and go to `https://yourdomain.com`
2. You should see the login screen
3. Log in with: `sarah@email.com` / `admin123`
4. **Change the admin password immediately** — go to Accounts → reset your own password

---

## Default Login Credentials (CHANGE THESE IMMEDIATELY)

| Name          | Email              | Password  | Role  |
|---------------|--------------------|-----------|-------|
| Sarah (Admin) | sarah@email.com    | admin123  | Admin |
| Jessica       | jessica@email.com  | pass123   | Mom   |
| Amanda        | amanda@email.com   | pass123   | Mom   |

---

## Ongoing Maintenance

### Deploy code updates
```bash
cd /home/sarah/app
git pull                          # if using git
cd server && npm install          # if dependencies changed
cd ../client && npm run build
cp -r build/* /var/www/classroom-fund/
pm2 restart classroom-fund-api
```

### View logs
```bash
pm2 logs classroom-fund-api       # live backend logs
sudo tail -f /var/log/nginx/error.log   # nginx errors
```

### Backup the database
```bash
pg_dump -U classroom_user -d classroom_fund -h localhost > backup_$(date +%Y%m%d).sql
```

### Restore from backup
```bash
psql -U classroom_user -d classroom_fund -h localhost < backup_20260101.sql
```

---

## Troubleshooting

**Site not loading?**
```bash
sudo systemctl status nginx
pm2 status
```

**API errors?**
```bash
pm2 logs classroom-fund-api
```

**Database connection errors?**
```bash
# Verify .env DB password matches what you set in PostgreSQL
cat /home/sarah/app/server/.env
```

**SSL certificate issues?**
```bash
sudo certbot certificates
sudo certbot renew
```

---

## Architecture Diagram

```
Internet
   │
   ▼
Nginx (port 80/443)
   │
   ├── /          → serves React files from /var/www/classroom-fund
   │
   └── /api/*     → proxies to Node.js (port 4000)
                        │
                        ▼
                   PostgreSQL (port 5432)
```

---

*Total setup time: approximately 45–60 minutes*
*Monthly cost: $5 (Linode Nanode 1GB)*
