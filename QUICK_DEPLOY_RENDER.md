# Quick Deploy to Render (FREE)

The fastest way to get DrukMatch online for free!

## Total Time: ~30 minutes
## Total Cost: $0 (with limitations)

---

## Step 1: Push Code to GitHub (5 minutes)

```bash
cd /home/kanisha13/Desktop/tinder

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repository on GitHub (github.com)
# Then push:
git remote add origin https://github.com/your-username/drukmatch.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Render Account (2 minutes)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub account (easiest)
3. Authorize Render to access your repositories

---

## Step 3: Create Database (5 minutes)

1. Click "New +" button
2. Select "PostgreSQL"
3. Fill in:
   - Name: `drukmatch-db`
   - Database: `drukmatch`
   - User: `drukmatch_user` (auto-suggested)
   - Region: Choose closest to Bhutan (Singapore recommended)
   - PostgreSQL Version: 15
   - Plan: **Free**
4. Click "Create Database"
5. Wait for database to provision (~2 minutes)
6. **SAVE THESE DETAILS:**
   - Internal Database URL (for backend)
   - External Database URL (for setup)

---

## Step 4: Set Up Database Schema (5 minutes)

```bash
# Use the External Database URL from Render
psql "postgres://drukmatch_user:password@hostname/drukmatch"

# When connected, run:
\i /home/kanisha13/Desktop/tinder/backend/database/schema.sql

# Verify tables were created:
\dt

# Exit:
\q
```

---

## Step 5: Deploy Backend (5 minutes)

1. Click "New +" → "Web Service"
2. Click "Connect account" if needed
3. Select your `drukmatch` repository
4. Fill in:
   - Name: `drukmatch-backend`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Plan: **Free**

5. Click "Advanced" and add Environment Variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate with: openssl rand -base64 32>
DB_USER=drukmatch_user
DB_HOST=<from Internal Database URL>
DB_NAME=drukmatch
DB_PASSWORD=<from Internal Database URL>
DB_PORT=5432
FRONTEND_URL=https://drukmatch-frontend.onrender.com
```

6. Click "Create Web Service"
7. Wait for deployment (~3 minutes)
8. **SAVE YOUR BACKEND URL**: `https://drukmatch-backend.onrender.com`

---

## Step 6: Deploy Frontend (5 minutes)

1. First, update frontend API URL:
   ```bash
   # Create frontend/.env.production
   echo "VITE_API_URL=https://drukmatch-backend.onrender.com" > frontend/.env.production

   # Commit and push
   git add frontend/.env.production
   git commit -m "Add production API URL"
   git push
   ```

2. In Render dashboard, click "New +" → "Static Site"
3. Select your `drukmatch` repository
4. Fill in:
   - Name: `drukmatch-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

5. Click "Create Static Site"
6. Wait for deployment (~3 minutes)
7. **YOUR APP IS LIVE!**: `https://drukmatch-frontend.onrender.com`

---

## Step 7: Final Configuration (2 minutes)

1. Copy your frontend URL
2. Go to backend service in Render
3. Update environment variable:
   - `FRONTEND_URL=https://drukmatch-frontend.onrender.com`
4. Backend will auto-redeploy (~1 minute)

---

## Step 8: Test Your App (5 minutes)

1. Open `https://drukmatch-frontend.onrender.com`
2. Register a new account
3. Upload photos
4. Complete profile
5. Test swiping (you'll need 2+ users)

---

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Database limited to 100MB storage
- 750 hours/month (sufficient for testing)

### Solutions:
- Use [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes (keeps it awake)
- Upgrade to paid plan ($7/month per service) for always-on

### Custom Domain (Optional)
1. Purchase domain from Namecheap (~$10/year)
2. In Render, go to your Static Site
3. Click "Custom Domain"
4. Add your domain and follow DNS instructions
5. SSL automatically configured!

---

## Monitoring Your App

### Free Monitoring Tools:
1. **UptimeRobot** (uptimerobot.com)
   - Monitor uptime
   - Get alerts when site is down
   - Free: 50 monitors

2. **Sentry** (sentry.io)
   - Error tracking
   - Performance monitoring
   - Free: 5,000 errors/month

---

## Costs Breakdown

### Free Plan (What you just deployed)
- Backend: Free (sleeps after inactivity)
- Frontend: Free
- Database: Free (100MB limit)
- Custom domain: Optional ($10/year)
- **Total: $0-1/month**

### Paid Plan (Recommended for production)
- Backend: $7/month (always on, 512MB RAM)
- Frontend: Free (static sites always free)
- Database: Free (upgrade to $7/month if >100MB needed)
- Custom domain: $10/year (~$1/month)
- **Total: $8/month**

---

## Upgrading Later

When you're ready to upgrade:

1. In Render dashboard, go to each service
2. Click "Settings" → "Plan"
3. Choose "Starter" plan ($7/month)
4. Benefit: Always on, no sleep delays

Or migrate to Railway/DigitalOcean using the full DEPLOYMENT_GUIDE.md

---

## Troubleshooting

### "Application Error" on frontend
- Check if backend is running
- Verify FRONTEND_URL in backend
- Check browser console for errors

### "Cannot connect to database"
- Verify database credentials
- Check if database is running
- Review backend logs in Render dashboard

### "CORS Error"
- Verify FRONTEND_URL matches your actual frontend URL
- Check CORS middleware in backend

### Images not showing
- First load after sleep might be slow
- Check if base64 encoding is working
- Verify image upload succeeded

---

## Quick Commands Reference

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Check Backend Health
```bash
curl https://drukmatch-backend.onrender.com/api/health
```

### View Logs
- Go to Render dashboard
- Click on service
- Click "Logs" tab

### Force Redeploy
- Go to service in Render
- Click "Manual Deploy" → "Deploy latest commit"

---

## Next Steps

1. **Test thoroughly** with real users
2. **Set up monitoring** (UptimeRobot)
3. **Get a custom domain** for professional look
4. **Gather feedback** and iterate
5. **Upgrade to paid plan** when you have regular users

---

## Support

If something goes wrong:
1. Check Render dashboard logs
2. Review DEPLOYMENT_GUIDE.md
3. Check GitHub Issues for similar problems
4. Render has great documentation at docs.render.com

---

**Congratulations! DrukMatch is now live! 🎉🇧🇹**

Share your app URL and start connecting people in Bhutan! ❤️
