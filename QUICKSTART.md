# Quick Start Guide

## Initial Setup

### 1. Install All Dependencies
```bash
npm run install:all
```

This will install dependencies for the root project, client, and server.

### 2. Database Setup

Create the database:
```bash
createdb hd520_platform
```

Run the schema:
```bash
psql -d hd520_platform -f server/src/config/schema.sql
```

### 3. Configure Environment Variables

**Server** (server/.env):
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
```

**Client** (client/.env):
```bash
cd client
cp .env.example .env
# Edit if needed (default should work)
```

### 4. Start Development Servers

From the root directory:
```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 5173) concurrently.

Or start them separately:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

### 5. Access the Application

Open your browser to: http://localhost:5173

## What's Implemented

✅ **Project Structure**
- Client/Server separation
- TypeScript configuration
- Tailwind CSS dark theme

✅ **Backend**
- Express server with TypeScript
- PostgreSQL database schema
- JWT authentication system
- Route structure for all features

✅ **Frontend**
- Landing page with three main sections
- Dark theme UI
- Navigation between pages
- Login page
- Training, Maintenance, and Trust Data pages (UI shells)

## Next Steps

### Phase 1: Training Module
1. Implement training module database queries
2. Create training module components
3. Add video player integration
4. Build quiz system
5. Track user progress

### Phase 2: AI Chatbot
1. Integrate Claude API
2. Build chat interface
3. Implement systematic troubleshooting flow
4. Add photo upload capability
5. Create knowledge base search

### Phase 3: Trust Data Dashboard
1. Implement metrics collection
2. Add Chart.js visualizations
3. Create real-time data updates
4. Build export functionality (PDF/CSV)
5. Add predictive alerts

### Phase 4: Advanced Features
1. Document upload and RAG integration
2. YouTube video timestamps
3. Service ticket workflow
4. Shift handoff system
5. Mobile responsiveness

## Development Commands

```bash
# Install dependencies
npm run install:all

# Run both client and server
npm run dev

# Run server only
npm run dev:server

# Run client only
npm run dev:client

# Build for production
npm run build
```

## Project Files Created

### Configuration
- ✅ Root package.json with scripts
- ✅ Client package.json with React + Vite + Tailwind
- ✅ Server package.json with Express + TypeScript
- ✅ TypeScript configurations
- ✅ Tailwind CSS config with dark theme
- ✅ Environment variable templates

### Backend
- ✅ Database schema (users, machines, tickets, kb_entries, etc.)
- ✅ Database connection setup
- ✅ Express server configuration
- ✅ JWT authentication middleware
- ✅ Auth controller and routes
- ✅ Route placeholders for all features
- ✅ TypeScript type definitions

### Frontend
- ✅ React app with Router setup
- ✅ Landing page with three-card layout (blue/orange/green)
- ✅ Login page
- ✅ Training page (Operator & Technician sections)
- ✅ Maintenance page (AI chatbot, photo, error codes, tickets)
- ✅ Trust Data dashboard page
- ✅ Dark theme styling with Tailwind

## User Roles

The platform supports four user roles:
- **Customer**: Basic access, can view machines and create tickets
- **Technician**: Full troubleshooting access with credential verification
- **Trainee**: Training modules only
- **Admin**: Complete platform access

## Database Tables

- `users` - User authentication and profiles
- `machines` - HD520 machine inventory
- `service_tickets` - Maintenance requests
- `kb_entries` - Knowledge base articles
- `training_modules` - Training content
- `training_progress` - User progress tracking
- `production_metrics` - Real-time machine data
- `documents` - Uploaded files and manuals
- `chat_history` - AI conversation logs
- `shift_handoffs` - Technician shift notes

## API Endpoints

All endpoints are prefixed with `/api`:

- `/auth` - Authentication (register, login, profile)
- `/users` - User management
- `/machines` - Machine inventory
- `/tickets` - Service tickets
- `/kb` - Knowledge base
- `/training` - Training modules
- `/chat` - AI chatbot
- `/metrics` - Production data

## Need Help?

Refer to the main [README.md](README.md) for detailed documentation.
