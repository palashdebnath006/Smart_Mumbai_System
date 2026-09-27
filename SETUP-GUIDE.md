# Smart City Dashboard - Setup Guide

This comprehensive guide will walk you through setting up the Smart City Dashboard from a downloaded ZIP file. Follow each step carefully to ensure a successful installation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Extract the Project](#step-1-extract-the-project)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Configure Environment](#step-3-configure-environment)
5. [Step 4: Initialize Database](#step-4-initialize-database)
6. [Step 5: Seed Demo Data](#step-5-seed-demo-data)
7. [Step 6: Start the Application](#step-6-start-the-application)
8. [Step 7: Test the Application](#step-7-test-the-application)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Purpose | Download |
|----------|---------|---------|----------|
| Node.js | 18.x or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| Bun (optional) | 1.x or higher | Fast JavaScript runtime | [bun.sh](https://bun.sh/) |
| Git | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### Verify Installation

Open a terminal and run:

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or higher

# Check npm version
npm --version
# Expected output: 9.x.x or higher

# If using Bun
bun --version
# Expected output: 1.x.x or higher
```

---

## Step 1: Extract the Project

### Windows

1. Right-click on the downloaded ZIP file (`smart-city-dashboard.zip`)
2. Select "Extract All..."
3. Choose a destination folder (e.g., `C:\Projects\`)
4. Click "Extract"

**Using Command Prompt:**
```cmd
# Navigate to downloads folder
cd %USERPROFILE%\Downloads

# Extract using PowerShell
powershell -Command "Expand-Archive -Path smart-city-dashboard.zip -DestinationPath C:\Projects\"
```

### macOS

1. Double-click the ZIP file to extract automatically
2. Or right-click and select "Open With" > "Archive Utility"

**Using Terminal:**
```bash
# Navigate to downloads folder
cd ~/Downloads

# Extract the ZIP file
unzip smart-city-dashboard.zip -d ~/Projects/
```

### Linux

```bash
# Navigate to downloads folder
cd ~/Downloads

# Extract the ZIP file
unzip smart-city-dashboard.zip -d ~/Projects/

# Or using tar if it's a tar.gz file
tar -xzf smart-city-dashboard.tar.gz -C ~/Projects/
```

### Navigate to Project Directory

```bash
# Replace with your actual path
cd path/to/smart-city-dashboard
```

---

## Step 2: Install Dependencies

### Option A: Using npm (Recommended for beginners)

```bash
npm install
```

This will:
- Read `package.json`
- Download all required packages
- Create `node_modules/` folder
- Generate `package-lock.json`

### Option B: Using Bun (Faster)

```bash
bun install
```

### Option C: Using Yarn

```bash
yarn install
```

### Option D: Using pnpm

```bash
pnpm install
```

### Verify Installation

Check that dependencies are installed:

```bash
# List installed packages
npm list --depth=0

# Or with bun
bun pm ls
```

---

## Step 3: Configure Environment

### Create Environment File

1. Create a new file named `.env` in the project root directory
2. Add the following content:

```env
# Database Configuration
DATABASE_URL="file:./db/custom.db"

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-characters"

# Application Settings
NEXT_PUBLIC_APP_NAME="Smart City Dashboard"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./db/custom.db` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Smart City Dashboard` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

### Generate a Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using online generator
# Visit: https://www.grc.com/passwords.htm
```

### Windows PowerShell

```powershell
# Create .env file
New-Item -Path .env -ItemType File

# Add content
Set-Content -Path .env -Value @"
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
"@
```

### Linux/macOS Terminal

```bash
# Create .env file with content
cat > .env << EOF
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
EOF
```

---

## Step 4: Initialize Database

### Generate Prisma Client

This creates the Prisma client based on your schema:

```bash
# Using npm
npm run db:generate

# Or using bun
bun run db:generate

# Or directly
npx prisma generate
```

### Push Schema to Database

This creates the SQLite database and tables:

```bash
# Using npm
npm run db:push

# Or using bun
bun run db:push

# Or directly
npx prisma db push
```

### Verify Database

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit your database.

### Database File Location

The SQLite database file is created at:
```
db/custom.db
```

---

## Step 5: Seed Demo Data

### Automatic Seeding

Start the development server first (see Step 6), then visit:

```
http://localhost:3000/api/seed
```

Or use curl:

```bash
curl http://localhost:3000/api/seed
```

### What Gets Seeded

The seeding process creates:

1. **Demo Users:**
   | Role | Email | Password |
   |------|-------|----------|
   | Admin | admin@smartcity.gov | admin123 |
   | Officer | officer@smartcity.gov | officer123 |
   | Citizen | citizen@smartcity.gov | citizen123 |

2. **Sample Data:**
   - Traffic sensors and readings
   - Environmental sensors and AQI readings
   - Water reservoirs and usage data
   - Energy grids and readings
   - Parking lots
   - News articles
   - Government schemes

### Manual Database Reset

If you need to reset the database:

```bash
# Reset database (WARNING: Deletes all data)
npm run db:reset

# Or
npx prisma migrate reset
```

---

## Step 6: Start the Application

### Development Mode

```bash
# Using npm
npm run dev

# Using bun
bun run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will start at: **http://localhost:3000**

### What Happens During Startup

1. Next.js compiles the application
2. Development server starts on port 3000
3. Hot Module Replacement (HMR) is enabled
4. Changes auto-refresh the browser

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

---

## Step 7: Test the Application

### 7.1 Open the Application

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You should see the Smart City Dashboard loading screen

### 7.2 Complete Onboarding

1. After loading, you'll see the onboarding carousel
2. Click "Next" to view all 6 slides
3. Click "Get Started" to proceed to login

### 7.3 Test Authentication

#### Option A: Use Demo Credentials

```
Email: admin@smartcity.gov
Password: admin123
```

#### Option B: Register New Account

1. Click "Register" tab
2. Enter your name, email, and password
3. Click "Create Account"

### 7.4 Explore Dashboard Features

After logging in, test these features:

1. **Navigation**: Click sidebar items to switch modules
2. **Traffic Module**: View traffic flow and incidents
3. **Environment Module**: Check AQI and weather data
4. **Safety Module**: View incidents and CCTV cameras
5. **Water Module**: Monitor reservoirs and usage
6. **Energy Module**: Check power grid status
7. **Waste Module**: View bin levels and trucks
8. **Parking Module**: Check parking availability
9. **News Module**: Read announcements and schemes

### 7.5 Test Theme Toggle

1. Click your avatar in the sidebar
2. Click the settings icon
3. Select "Light Mode" or "Dark Mode"

### 7.6 Test Logout

1. Click your avatar in the sidebar
2. Click "Logout"
3. You should return to the login screen

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot find module 'xxx'"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### Issue: "Port 3000 is already in use"

**Solution:**
```bash
# Find process using port 3000
# On macOS/Linux
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### Issue: "Database connection error"

**Solution:**
```bash
# Check if database file exists
ls -la db/custom.db

# If not, recreate database
npm run db:push
```

#### Issue: "Prisma Client not found"

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate
```

#### Issue: "JWT verification failed"

**Solution:**
1. Check your `.env` file has `JWT_SECRET`
2. Clear localStorage in browser
3. Restart the development server

#### Issue: "Login fails with 'Invalid credentials'"

**Solution:**
```bash
# Re-seed the database
curl http://localhost:3000/api/seed

# Then try again with:
# Email: admin@smartcity.gov
# Password: admin123
```

#### Issue: "Blank page after login"

**Solution:**
1. Clear browser cache and localStorage
2. Check browser console for errors
3. Verify API responses in Network tab

### Debug Mode

Enable debug logging:

```env
# Add to .env
DEBUG=prisma:*
NEXT_PUBLIC_DEBUG=true
```

### Check Logs

```bash
# Development logs
tail -f dev.log

# Or view recent logs
tail -100 dev.log
```

---

## Production Deployment

### Build for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm run start
```

### Environment Variables for Production

```env
# Production .env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-production-secret-min-32-characters-long"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t smart-city-dashboard .
docker run -p 3000:3000 smart-city-dashboard
```

#### Option 3: Traditional Server

```bash
# Build on your machine
npm run build

# Copy these to server:
# - .next/
# - public/
# - prisma/
# - db/
# - package.json
# - .env

# On server:
npm install --production
npx prisma generate
npm run start
```

### Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS
- [ ] Set secure cookie settings
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure proper CORS
- [ ] Remove demo credentials
- [ ] Enable logging and monitoring

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start development | `npm run dev` |
| Build for production | `npm run build` |
| Start production | `npm run start` |
| Run linting | `npm run lint` |
| Generate Prisma client | `npx prisma generate` |
| Push schema changes | `npm run db:push` |
| Open Prisma Studio | `npx prisma studio` |
| Reset database | `npm run db:reset` |
| Seed demo data | `curl http://localhost:3000/api/seed` |

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Check server logs in `dev.log`
4. Verify your `.env` configuration
5. Ensure all dependencies are installed

---

## Next Steps

After successful setup:

1. **Customize the Dashboard**: Modify colors in `tailwind.config.ts`
2. **Add Real Data**: Connect to real data sources
3. **Extend Features**: Add new modules as needed
4. **Configure Alerts**: Set up real-time notifications
5. **Add Maps**: Integrate mapping services like Google Maps or Mapbox

---

Congratulations! Your Smart City Dashboard is now set up and running. Enjoy exploring the features!
