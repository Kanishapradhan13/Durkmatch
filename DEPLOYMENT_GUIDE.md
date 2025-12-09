# DrukMatch Deployment Guide

This guide covers multiple deployment options for the DrukMatch dating application.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Option 1: Deploy to Render (Easiest)](#option-1-deploy-to-render-easiest)
3. [Option 2: Deploy to Railway](#option-2-deploy-to-railway)
4. [Option 3: Deploy to DigitalOcean](#option-3-deploy-to-digitalocean)
5. [Option 4: Deploy to AWS](#option-4-deploy-to-aws)
6. [Database Hosting](#database-hosting)
7. [Environment Configuration](#environment-configuration)
8. [Post-Deployment Tasks](#post-deployment-tasks)

---

## Pre-Deployment Checklist

### 1. Prepare Your Code
- [x] Remove all test/seed data (already done)
- [ ] Set up Git repository
- [ ] Create .gitignore files
- [ ] Test locally one final time

### 2. Create Git Repository (if not already done)
```bash
cd /home/kanisha13/Desktop/tinder
git init
git add .
git commit -m "Initial commit - DrukMatch application"

# Create repository on GitHub/GitLab
# Then push:
git remote add origin your-repository-url
git branch -M main
git push -u origin main
```

### 3. Environment Variables
You'll need these for production:
- `JWT_SECRET` - Generate a secure random string
- `DB_PASSWORD` - Your production database password
- `FRONTEND_URL` - Your deployed frontend URL
- Database connection details

---

## Option 1: Deploy to Render (Easiest - FREE TIER)

Render is one of the easiest platforms with generous free tier.

### Backend Deployment (Node.js)

1. **Sign up at [render.com](https://render.com)**

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `drukmatch-db`
   - Database: `drukmatch`
   - User: Auto-generated
   - Free tier is sufficient for small apps
   - Click "Create Database"
   - **Save the connection details!**

3. **Run Schema on Database**
   ```bash
   # Connect using the External Database URL from Render
   psql "your-postgres-connection-url"

   # Then run:
   \i /home/kanisha13/Desktop/tinder/backend/database/schema.sql
   \q
   ```

4. **Create Web Service for Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `drukmatch-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Choose Free tier

5. **Add Environment Variables**
   Go to Environment tab and add:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_generated_secret_here
   DB_USER=your_render_db_user
   DB_HOST=your_render_db_host
   DB_NAME=drukmatch
   DB_PASSWORD=your_render_db_password
   DB_PORT=5432
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Note your backend URL: `https://drukmatch-backend.onrender.com`

### Frontend Deployment (React)

1. **Update Frontend API URL**
   ```bash
   # Edit frontend/.env.production
   VITE_API_URL=https://drukmatch-backend.onrender.com
   ```

2. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your repository
   - Name: `drukmatch-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Choose Free tier

3. **Deploy**
   - Click "Create Static Site"
   - Your app will be live at: `https://drukmatch-frontend.onrender.com`

4. **Update Backend CORS**
   - Go back to backend service
   - Update `FRONTEND_URL` environment variable with your frontend URL
   - Service will auto-redeploy

**Total Cost: FREE** (with limitations: services sleep after 15 min of inactivity)

---

## Option 2: Deploy to Railway (Easy - $5/month)

Railway offers a better free tier and simpler deployment.

### Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Add PostgreSQL**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically provisions it

4. **Deploy Backend**
   - Click "+ New"
   - Select "GitHub Repo" → Choose your repo
   - Root directory: `/backend`
   - Railway auto-detects Node.js
   - Add environment variables (similar to Render)
   - Generate domain for backend

5. **Deploy Frontend**
   - Click "+ New" in same project
   - Select "GitHub Repo" → Choose your repo
   - Root directory: `/frontend`
   - Build command: `npm install && npm run build`
   - Start command: `npx vite preview --host --port $PORT`
   - Generate domain

6. **Run Database Schema**
   - Railway provides a PostgreSQL URL
   - Connect and run schema.sql

**Total Cost: $5/month** (includes all services)

---

## Option 3: Deploy to DigitalOcean (Moderate - ~$12/month)

Best for scalability and full control.

### What You Need:
- DigitalOcean account
- Basic Linux knowledge

### Steps:

1. **Create Droplet (Virtual Server)**
   - Sign up at [digitalocean.com](https://digitalocean.com)
   - Create → Droplets
   - Choose Ubuntu 22.04 LTS
   - Basic plan: $6/month (1GB RAM)
   - Add SSH key

2. **Create Managed PostgreSQL Database**
   - Create → Databases → PostgreSQL
   - Basic plan: $15/month
   - Or install PostgreSQL on droplet (free but manual setup)

3. **Set Up Server**
   ```bash
   # SSH into droplet
   ssh root@your_droplet_ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Nginx (web server)
   sudo apt-get install nginx

   # Install PM2 (process manager)
   sudo npm install -g pm2

   # Install Git
   sudo apt-get install git
   ```

4. **Deploy Application**
   ```bash
   # Clone your repository
   git clone your-repo-url /var/www/drukmatch
   cd /var/www/drukmatch

   # Setup backend
   cd backend
   npm install
   cp .env.production.example .env
   # Edit .env with production values
   nano .env

   # Start backend with PM2
   pm2 start src/server.js --name drukmatch-backend
   pm2 startup
   pm2 save

   # Setup frontend
   cd ../frontend
   npm install
   npm run build
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/drukmatch
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/drukmatch/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/drukmatch /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set Up SSL (HTTPS)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

7. **Set Up Database**
   ```bash
   psql "your-database-connection-string"
   \i /var/www/drukmatch/backend/database/schema.sql
   \q
   ```

**Total Cost: $6-21/month** (depending on database choice)

---

## Option 4: Deploy to AWS (Advanced - Variable Cost)

Most scalable but complex setup. Best for serious production apps.

### Services Needed:
- **EC2**: Virtual server (~$10/month)
- **RDS**: Managed PostgreSQL (~$15/month)
- **S3**: File storage (~$1/month)
- **CloudFront**: CDN (optional)
- **Route 53**: DNS (~$0.50/month)

### Quick Setup:
1. Launch EC2 instance (Ubuntu)
2. Create RDS PostgreSQL database
3. Follow similar steps to DigitalOcean
4. Set up Application Load Balancer for scalability
5. Configure Auto Scaling (optional)

**Total Cost: ~$25-50/month** (can scale up/down based on traffic)

---

## Database Hosting

### Managed PostgreSQL Options:

1. **Render.com PostgreSQL** (Free tier available)
   - Pros: Easy, free tier
   - Cons: Sleeps after inactivity

2. **Railway PostgreSQL** ($5/month)
   - Pros: Always on, easy setup
   - Cons: Cost

3. **DigitalOcean Managed Database** ($15/month)
   - Pros: Reliable, backups included
   - Cons: More expensive

4. **AWS RDS** (~$15-30/month)
   - Pros: Enterprise-grade, scalable
   - Cons: Complex setup

5. **Supabase** (Free tier available)
   - Pros: PostgreSQL + extras, free tier
   - Cons: Limited storage on free tier

---

## Environment Configuration

### Backend Production .env
```env
NODE_ENV=production
PORT=5000
DB_USER=your_production_user
DB_HOST=your_production_host
DB_NAME=drukmatch_production
DB_PASSWORD=your_secure_password
DB_PORT=5432
JWT_SECRET=your_super_secure_32_char_random_string
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Production Configuration
Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com
```

### Generate Secure JWT Secret:
```bash
openssl rand -base64 32
```

---

## Post-Deployment Tasks

### 1. Database Backups
```bash
# Automated daily backups (add to crontab)
0 2 * * * pg_dump -h your_db_host -U your_db_user -d drukmatch > /backups/drukmatch_$(date +\%Y\%m\%d).sql
```

### 2. Monitoring
- Set up uptime monitoring (UptimeRobot, free)
- Enable error logging (Sentry, free tier)
- Monitor server resources

### 3. Security
- Enable firewall (UFW on Linux)
- Keep dependencies updated
- Regular security audits
- Set up fail2ban for SSH protection

### 4. Domain Setup
- Purchase domain from Namecheap/GoDaddy (~$10/year)
- Point DNS to your server IP
- Set up SSL certificate (Let's Encrypt, free)

### 5. CDN (Optional)
- Use Cloudflare (free tier) for:
  - DDoS protection
  - SSL
  - Caching
  - Performance

---

## Recommended Setup for Bhutan

For a Bhutanese dating app starting out:

**Budget Option (~$0-5/month):**
- Frontend: Render Static Site (Free)
- Backend: Render Web Service (Free)
- Database: Render PostgreSQL (Free)
- Domain: Namecheap (~$10/year)
- **Total: ~$1/month**

**Production Ready (~$20/month):**
- Frontend: Railway (included)
- Backend: Railway (included)
- Database: Railway PostgreSQL (included)
- Domain: Your choice (~$10/year)
- CDN: Cloudflare (Free)
- **Total: ~$6/month**

**Scalable Setup (~$40/month):**
- Server: DigitalOcean Droplet ($12/month)
- Database: DigitalOcean Managed ($15/month)
- CDN: Cloudflare (Free)
- Backups: DigitalOcean Spaces ($5/month)
- Domain: Your choice (~$10/year)
- Monitoring: Sentry Free Tier
- **Total: ~$33/month**

---

## Testing Your Deployment

After deployment, test these critical features:

1. **Registration Flow**
   - Create new account
   - Upload photos
   - Complete all steps

2. **Login**
   - Log in with created account
   - Check if profile loads

3. **Swiping**
   - View potential matches
   - Swipe left and right

4. **Matching**
   - Create matches
   - Verify both users see the match

5. **Chat**
   - Send messages
   - Check real-time delivery
   - Test unread indicators

6. **Profile Updates**
   - Edit profile
   - Update photos
   - Change preferences

---

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Verify FRONTEND_URL is set correctly
   - Check CORS middleware in backend

2. **Database Connection Failed**
   - Verify database credentials
   - Check if database allows external connections
   - Verify SSL requirements

3. **Images Not Loading**
   - Check base64 encoding
   - Verify API is receiving photos
   - Check database field types

4. **WebSocket Connection Failed**
   - Ensure Socket.io is configured for production
   - Check if host allows WebSocket connections
   - Verify port forwarding

---

## Maintenance

### Regular Tasks:
- **Daily**: Monitor error logs
- **Weekly**: Check database size, review user reports
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Review and optimize database queries
- **Yearly**: Renew domain, review hosting costs

---

## Support and Scaling

As your app grows:

1. **1-100 users**: Free/budget tier sufficient
2. **100-1,000 users**: Upgrade to Railway or basic DigitalOcean
3. **1,000-10,000 users**: DigitalOcean with managed database
4. **10,000+ users**: Consider AWS with Auto Scaling, Load Balancer, CDN

---

## Need Help?

For Bhutan-specific hosting recommendations or deployment assistance:
- Check Bhutan Telecom cloud services
- Consider India-based hosting (lower latency for Bhutan)
- Join Bhutan developer communities for local insights

Good luck with DrukMatch! 🇧🇹❤️
