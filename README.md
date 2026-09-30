# BugFlow AI — Autonomous Bug Triage & Resolution Platform

A full-stack AI-powered bug triage platform with a clean separation between the React frontend UI and the Node.js/Express backend foundation.

---

## Project Structure

```
bug-triage-ai/
│
├── frontend/                     # Complete React + Vite Application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── assets/               # Local icons and SVGs
│   │   ├── components/           # UI components (Sidebar, Header, etc.)
│   │   ├── context/              # React Context (BugContext, role state)
│   │   ├── data/                 # Rich realistic mock datasets
│   │   ├── layouts/              # MainLayout shell
│   │   ├── pages/                # Developer, QA, Manager, Inbox, Details, Login
│   │   ├── App.jsx               # Route tree & navigation
│   │   ├── App.css               # Component-level styles
│   │   ├── main.jsx              # App entry point
│   │   └── index.css             # Tailwind & theme styles
│   │
│   ├── package.json              # Frontend dependencies
│   ├── package-lock.json
│   ├── vite.config.js            # Vite configuration (port 5173)
│   └── index.html                # HTML entry point
│
├── backend/                      # Node.js + Express API Foundation
│   ├── src/
│   │   ├── config/               # Environment & server config
│   │   ├── controllers/          # Request handlers (health, bugs)
│   │   ├── middleware/           # Error handling & 404 middleware
│   │   ├── models/               # Data models & schema blueprints
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Core service placeholders
│   │   │   ├── aiTriageService.js
│   │   │   ├── duplicateDetectionService.js
│   │   │   ├── reproductionService.js
│   │   │   ├── assignmentService.js
│   │   │   └── bugIngestionService.js
│   │   └── server.js             # Express application entry point
│   │
│   ├── package.json              # Backend dependencies (express, cors, dotenv)
│   └── .env.example              # Environment variables template
│
├── .gitignore                    # Global git ignore
└── README.md                     # Documentation
```

---

## Getting Started

### 1. Frontend Setup (React + Vite)

The frontend runs independently with local state and mock data on `http://localhost:5173`.

```bash
cd frontend
npm install
npm run dev
```

- **URL:** [http://localhost:5173](http://localhost:5173)
- **Features:**
  - Role-based views: Developer Dashboard, QA Dashboard, Manager Dashboard
  - Bug Inbox with multi-faceted filtering & search
  - Bug Details view with interactive AI Triage analysis simulation
  - Automated Reproduction test runner
  - Live state sync across dashboards via React Context

---

### 2. Backend Setup (Node.js + Express)

The backend provides the API foundation and runs independently on `http://localhost:5000`.

```bash
cd backend
npm install
npm run dev
```

- **Health Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Response:**
  ```json
  {
    "success": true,
    "message": "BugFlow AI backend is running"
  }
  ```

---

## Future Backend Modules

The backend architecture is prepared for the following core capabilities:
1. **Authentication & RBAC** (Developer, QA, Engineering Manager, Admin)
2. **Multi-Source Ingestion** (GitHub, Jira, Sentry, Webhooks)
3. **AI Bug Analysis & Root Cause Deduction** (`aiTriageService.js`)
4. **Duplicate Detection & Semantic Clustering** (`duplicateDetectionService.js`)
5. **Headless Reproduction Engine** (`reproductionService.js`)
6. **Smart Team & Developer Routing** (`assignmentService.js`)
7. **Audit Activity & Verification Lifecycles**
