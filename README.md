# 🤖 AI-SaaS-CRM-System

> Production-grade AI-Powered CRM System built with the MERN Stack — designed as an internship-level portfolio project for AI & Data Science students.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

---

## ✨ AI Features

| Feature | Description |
|--------|-------------|
| 🎯 **Lead Scoring** | Auto-scores leads 0–100 using 5 weighted ML features |
| 💼 **Deal Prediction** | Sigmoid-normalized logistic regression predicts close probability |
| 🤖 **Smart Recommendations** | Context-aware CRM actions (follow up, at risk, high value) |
| 🧠 **Churn Prediction** | Predicts customer churn risk with recommended actions |
| 📊 **Analytics Dashboard** | Revenue charts, conversion rates, pipeline health radar |

---

## 🏗 Architecture

```
AI-SaaS-CRM-System/
├── backend/                  Express.js REST API (MVC Pattern)
│   ├── config/               MongoDB connection
│   ├── controllers/          Business logic layer
│   ├── middleware/           JWT auth + RBAC + error handler
│   ├── models/               Mongoose schemas
│   ├── routes/               API endpoints
│   └── utils/
│       ├── aiEngine.js       ← Core AI algorithms
│       ├── socketService.js  ← Real-time notifications
│       ├── emailService.js   ← Email automation
│       └── activityLogger.js ← Audit trail
└── frontend/                 React 18 SPA
    └── src/
        ├── context/          Auth + Socket + Theme state
        ├── pages/            Dashboard, Leads, Deals, Tickets...
        ├── components/       Layout, Chatbot, Notifications
        └── utils/            Axios API client
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

- App → http://localhost:3000
- API → http://localhost:5000

---

## 🔐 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Customers *(JWT required)*
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id                 [Admin only]
GET    /api/customers/:id/churn-prediction
```

### Leads *(AI Scoring)*
```
POST   /api/leads         → Creates lead + auto-calculates AI score
GET    /api/leads         → Returns leads sorted by AI score
GET    /api/leads/:id     → Returns lead with AI score breakdown
PUT    /api/leads/:id     → Updates + recalculates AI score
DELETE /api/leads/:id
```

### Deals *(AI Prediction)*
```
POST   /api/deals         → Creates deal + predicts close probability
GET    /api/deals
GET    /api/deals/:id     → Returns deal + AI insights
PUT    /api/deals/:id     → Updates + recalculates probability
DELETE /api/deals/:id
PUT    /api/deals/:id/stage
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
GET    /api/analytics/dashboard        → All KPI metrics + chart data
GET    /api/analytics/recommendations  → AI-generated CRM recommendations
GET    /api/analytics/insights         → AI forecasting + trend analysis
```

### Admin *(Admin only)*
```
GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Export *(Admin only)*
```
GET    /api/export/leads/csv
GET    /api/export/deals/csv
```

---

## 🤖 AI Algorithm Details

### Lead Scoring Formula

```
Score = BudgetScore        (0–30 pts)
      + CompanySizeScore   (0–20 pts)
      + InteractionScore   (0–20 pts)
      + EmailResponseScore (0–20 pts)
      + ConversionBonus    (0–10 pts)
─────────────────────────────────────
Total: 0 – 100

Category:  Low (0–40) | Medium (41–70) | High (71–100)
```

### Deal Probability — Logistic Regression Style

```
RawScore = StageWeight          (0–35)
         + LeadScoreContrib     (0–20)
         + BudgetConfirmed      (0–15)
         + ChampionBonus        (0–15)
         + StakeholderScore     (0–10)
         − CompetitorPenalty    (0–10)
         − PipelineDecay        (0–5)

Probability = sigmoid(RawScore)
            = 100 / (1 + e^(−0.08 × (rawScore − 50)))
```

### Customer Churn Prediction

```
ChurnRisk = RecencyScore       (0–40)
          + TicketStressScore  (0–20)
          + EngagementScore    (0–20)
          + RevenueScore       (0–15)
          + DealScore          (0–10)

RiskLevel: Low | Medium | High | Critical
```

---

## 🔒 Role-Based Access

| Role | Permissions |
|------|------------|
| **Admin** | Full access — create, read, update, delete all + user management |
| **Sales** | Manage leads, deals, customers |
| **Support** | Manage tickets, view customers |

---

## 🧰 Tech Stack

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs · Helmet · Socket.io

**Frontend:** React 18 · React Router v6 · Recharts · Axios · Socket.io-client

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

## 👨‍💻 Author

Built with ❤️ as an AI & Data Science portfolio project.

> *"Not just CRUD — this is AI-powered business intelligence."*
