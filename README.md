# 🤖 AI-SaaS-CRM-System

**Production-grade AI-Powered CRM built with MERN Stack**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://mongodb.com)

---

## ✨ AI Features

| Feature | Description |
|---|---|
| 🎯 **Lead Scoring** | Auto-scores leads 0–100 using 5 weighted ML features |
| 💼 **Deal Prediction** | Sigmoid-normalized logistic regression predicts close probability |
| 🤖 **Smart Recommendations** | Context-aware CRM actions (follow up, at risk, high value) |
| 📊 **Analytics Dashboard** | Revenue charts, conversion rates, pipeline health radar |

---

## 🏗 Architecture

```
AI-SaaS-CRM-System/
├── backend/          Express.js REST API (MVC)
│   ├── config/       MongoDB connection
│   ├── controllers/  Business logic
│   ├── middleware/   JWT auth + RBAC + error handler
│   ├── models/       Mongoose schemas
│   ├── routes/       API endpoints
│   └── utils/        AI Engine (aiEngine.js)
└── frontend/         React 18 SPA
    └── src/
        ├── context/  Auth state
        ├── pages/    Dashboard, Leads, Deals, etc.
        ├── components/ Layout, charts
        └── utils/    Axios API client
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or yarn

### 1. Clone
```bash
git clone https://github.com/your-username/AI-SaaS-CRM-System.git
cd AI-SaaS-CRM-System
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Docker (All-in-one)
```bash
docker-compose up --build
```

App runs at: http://localhost:3000
API runs at: http://localhost:5000

---

## 🔐 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Customers (JWT required)
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id  [Admin only]
```

### Leads (AI Scoring)
```
POST   /api/leads         → Creates lead + auto-calculates AI score
GET    /api/leads          → Returns leads sorted by AI score
GET    /api/leads/:id      → Returns lead with AI score breakdown
PUT    /api/leads/:id      → Updates + recalculates AI score
DELETE /api/leads/:id
```

### Deals (AI Prediction)
```
POST   /api/deals          → Creates deal + predicts close probability
GET    /api/deals
GET    /api/deals/:id      → Returns deal + AI insights
PUT    /api/deals/:id      → Updates + recalculates probability
DELETE /api/deals/:id
```

### Tickets
```
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
POST   /api/tickets/:id/comments
```

### Analytics
```
GET    /api/analytics/dashboard       → All KPI metrics + chart data
GET    /api/analytics/recommendations → AI-generated CRM recommendations
```

---

## 🤖 AI Algorithm Details

### Lead Scoring Formula
```
Score = BudgetScore(0-30)
      + CompanySizeScore(0-20)
      + InteractionScore(0-20)
      + EmailResponseScore(0-20)
      + PreviousConversionBonus(0-10)

Category: Low(0-40) | Medium(41-70) | High(71-100)
```

### Deal Probability Formula (Logistic Regression Style)
```
RawScore = StageWeight(0-35)
         + LeadScoreContribution(0-20)
         + BudgetConfirmed(0-15)
         + ChampionBonus(0-15)
         + StakeholderScore(0-10)
         - CompetitorPenalty(0-10)
         - PipelineDecay(0-5)

Probability = sigmoid(RawScore) = 100 / (1 + e^(-0.08*(rawScore-50)))
```

---

## 🔒 Role-Based Access

| Role | Permissions |
|---|---|
| **Admin** | Full access — create, read, update, delete all |
| **Sales** | Manage leads, deals, customers |
| **Support** | Manage tickets, view customers |

---

## 🧰 Tech Stack

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs · Helmet

**Frontend:** React 18 · React Router v6 · Recharts · Axios

**DevOps:** Docker · Docker Compose

---

## 📁 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ai_saas_crm
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

*Built for AI & Data Science portfolios — internship-ready, production-grade.*