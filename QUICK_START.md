# DrukMatch - Quick Start Guide

Get DrukMatch running locally in under 5 minutes!

## Prerequisites Check
```bash
node --version  # Should be 18+
psql --version  # Should be 13+
```

## Step 1: Database Setup (2 minutes)

```bash
# Create database
createdb drukmatch

# Create tables
psql -d drukmatch -f backend/database/schema.sql

# Load sample data (optional but recommended for testing)
psql -d drukmatch -f backend/database/seed.sql
```

## Step 2: Backend Setup (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set your database password
# Minimum required: DB_PASSWORD and JWT_SECRET

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:5000`

## Step 3: Frontend Setup (1 minute)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Step 4: Test the Application

### Option 1: Use Sample Data
If you loaded the seed data, you can login with:
- Email: `tashi@example.com`
- Password: `Password123!`

(Or any other user from the seed.sql file)

### Option 2: Register New Account
1. Go to `http://localhost:3000`
2. Click "Sign up"
3. Fill in the registration form (3 steps)
4. Start swiping!

## Quick Test Checklist

- [ ] Register a new account
- [ ] Complete profile setup
- [ ] View discover page and see potential matches
- [ ] Swipe right on a user
- [ ] Create a second account (different browser/incognito)
- [ ] Swipe right on the first user
- [ ] See the "It's a Match!" modal
- [ ] Send a message in chat
- [ ] See real-time message delivery

## Common Issues & Solutions

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep drukmatch`
- Check .env file has correct credentials

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_URL in frontend/.env.local (if created)

### Database errors
- Run schema again: `psql -d drukmatch -f backend/database/schema.sql`
- Check PostgreSQL logs: `tail -f /usr/local/var/log/postgres.log`

## Running Tests

### Backend tests:
```bash
cd backend
npm test
```

### Frontend tests:
```bash
cd frontend
npm test
```

## Next Steps

1. Read the main README.md for full documentation
2. Explore the API endpoints with the documentation
3. Customize the colors/design in tailwind.config.js
4. Add more features or modify existing ones

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │         │   Express   │         │ PostgreSQL  │
│  Frontend   │ ◄─────► │   Backend   │ ◄─────► │  Database   │
│  (Port 3000)│         │  (Port 5000)│         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │
      │                        │
      └────────────────────────┘
           Socket.io (Real-time Chat)
```

## Development Tips

- Backend auto-reloads with nodemon
- Frontend has HMR (Hot Module Replacement)
- Use React DevTools for frontend debugging
- Use Postman/Thunder Client for API testing
- Check browser Network tab for Socket.io connections

## Support

For detailed documentation, see README.md

Happy coding! 🐉
