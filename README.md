# HD520 Service Platform

A comprehensive service technician platform for HD520 industrial printers, featuring AI-powered maintenance assistance, training modules, production metrics tracking, and administrative tools.

## 🚀 Features

- **AI Maintenance Assistant** - RAG-powered chatbot with Claude Vision
- **Training Modules** - Interactive courses with quizzes and certification
- **Knowledge Base** - Searchable documentation with fuzzy search
- **Photo Upload** - Upload error screens for AI analysis
- **Service Tickets** - Track and manage repair tickets
- **Admin Dashboard** - Document management and knowledge review

## 📋 Tech Stack

**Backend:** Node.js, TypeScript, Express, SQLite, Anthropic Claude API  
**Frontend:** React, TypeScript, Vite, Tailwind CSS

## 🛠️ Local Development

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/hd520-service-platform.git
cd hd520-service-platform

# Install backend
cd server && npm install

# Install frontend  
cd ../client && npm install
```

### Environment Variables

**server/.env:**
```
PORT=5001
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-api-key
CLIENT_URL=http://localhost:5173
```

**client/.env:**
```
VITE_API_URL=http://localhost:5001
```

### Run Development Servers

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Open http://localhost:5173

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway deployment instructions.

## 📖 Documentation

- [TEST_REPORT.md](TEST_REPORT.md) - Comprehensive testing guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - All 14 phases completed

## 📝 License

ISC
