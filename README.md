# SafeRoute AI — AI-Powered Campus Safety Route Recommendation System

> **Academic Prototype** | B.Tech CSE Final Year Project  
> All safety scores are **estimates** based on available data and are **not guarantees** of real-world safety.  
> This system is **not** an emergency or security service.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features mapped to SRS](#2-features-mapped-to-srs)
3. [SRS Traceability Table](#3-srs-traceability-table)
4. [Technology Stack](#4-technology-stack)
5. [Folder Structure](#5-folder-structure)
6. [Database Models](#6-database-models)
7. [API Endpoints](#7-api-endpoints)
8. [How the AI Mock Works](#8-how-the-ai-mock-works)
9. [How to Run Locally](#9-how-to-run-locally)
10. [How to Deploy](#10-how-to-deploy)
11. [Creating the Admin Account](#11-creating-the-admin-account)
12. [No API Key Needed](#12-no-api-key-needed)

---

## 1. Project Overview

SafeRoute AI helps students compare campus routes using more than distance and time. The system combines:

- **Lighting quality** along each route
- **Approved safety reports** submitted by students
- **Security and CCTV points** maintained by administrators
- **Crowd / activity level** for the selected time
- **Time of travel** (morning, evening, night)

…into a single, explainable **safety score (0–100)** with a risk level and reasons. An AI service (or rule-based fallback) then recommends the route with the better estimated safety profile.

---

## 2. Features Mapped to SRS

| # | SRS Feature | Description |
|---|-------------|-------------|
| 1 | **User Authentication & Dashboard** (FR1, FR2) | Register, login, JWT sessions, role-based access, personalised dashboard with quick actions, recent searches, recent reports |
| 2 | **Route Search, Map & AI Safety Score** (FR3–FR7) | Select start/destination/time, display 2–3 routes on Leaflet+OSM map, compute weighted safety score, AI analysis & starred recommendation |
| 3 | **Unsafe Location Reporting** (FR8) | Submit reports with category, severity, description, optional image; track status in My Reports |
| 4 | **Admin Dashboard & Report Management** (FR9, FR10) | Stats cards, Recharts charts, paginated report table, approve/reject/delete actions |
| 5 | **Safety Points Management & Route History** (FR11–FR13) | CRUD for CCTV/Security/Emergency/Lighting points, map preview, route search history |

---

## 3. SRS Traceability Table

| SRS Req ID | Requirement Name | Implemented As | API Endpoint | Page |
|---|---|---|---|---|
| FR1 | User Registration | `POST /api/auth/register` with bcrypt | `POST /api/auth/register` | `/register` |
| FR1 | User Login | JWT generation, role-based redirect | `POST /api/auth/login` | `/login` |
| FR1 | JWT Auth | `authMiddleware.js` protect + adminOnly | All protected routes | — |
| FR1 | RBAC | `user` / `admin` roles, `AdminRoute` guard | — | All pages |
| FR2 | User Dashboard | Welcome, quick actions, stats, recent searches & reports | `GET /api/routes/history`, `GET /api/reports/my` | `/dashboard` |
| FR3 | Location Selection | Datalist from campus locations API + click-to-fill | `GET /api/routes/locations` | `/find-route` |
| FR3 | Input Validation | Start ≠ destination, both required | `POST /api/routes/search` | `/find-route` |
| FR4 | Multiple Route Display | 3 candidate routes with distance, time, score, risk | `POST /api/routes/search` | `/route-results` |
| FR5 | Safety Score System | `scoringService.js` weighted formula (SRS §6) | Inside `/api/routes/search` | `/route-results`, `/route-details/:id` |
| FR5 | Score Estimates Labelled | Disclaimer on every score view | — | All route pages |
| FR6 | AI Route Risk Analysis | `aiService.js` Gemini/OpenAI + `aiService.js` mock fallback | `POST /api/routes/analyze` | `/route-results` |
| FR6 | AI Fallback | Rule-based fallback if AI fails/no key | `POST /api/routes/analyze` | `/route-results` |
| FR7 | Recommended Route | ★ star badge, "Recommended based on available data" text | `POST /api/routes/analyze` | `/route-results`, `/route-details/:id` |
| FR8 | Report Submission | Form with category, severity, description, image upload | `POST /api/reports` | `/report` |
| FR8 | My Reports | View own reports, delete pending | `GET /api/reports/my`, `DELETE /api/reports/:id` | `/my-reports` |
| FR9 | Admin Dashboard | Stat cards + Recharts pie (status) + bar (category) | `GET /api/admin/stats` | `/admin/dashboard` |
| FR10 | Admin Report Management | Table with View/Approve/Reject/Delete, filters, pagination | `GET /api/admin/reports`, `PUT …/approve`, `PUT …/reject`, `DELETE` | `/admin/reports` |
| FR11 | Safety Points CRUD | Add/Edit/Delete CCTV, Security, Emergency, Lighting | `GET/POST /api/safety-points`, `PUT/DELETE /api/safety-points/:id` | `/admin/safety-locations` |
| FR12 | Map System | Leaflet + OSM, custom SVG markers, polylines, all marker types | Client-side `CampusMap.jsx` | `/route-results`, `/route-details/:id`, `/admin/safety-locations` |
| FR13 | Route Search History | Stored on every search, shown on dashboard | `GET /api/routes/history` | `/dashboard` |

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6, Axios |
| Maps | Leaflet 1.9 + react-leaflet + OpenStreetMap tiles |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer |
| Rate Limiting | express-rate-limit |
| AI (real) | Gemini API or OpenAI API — **server-side only** |
| AI (mock/fallback) | `client/src/services/aiService.js` — **no API key required** |

---

## 5. Folder Structure

```
saferoute-ai/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── CampusMap.jsx        ← Leaflet map
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RouteCard.jsx
│   │   │   ├── ScoreBadge.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── UserLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← JWT session state
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── user/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── FindRoute.jsx
│   │   │   │   ├── MyReports.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── ReportLocation.jsx
│   │   │   │   ├── RouteDetails.jsx
│   │   │   │   └── RouteResults.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminLogin.jsx
│   │   │       ├── AdminReports.jsx
│   │   │       └── SafetyLocations.jsx
│   │   ├── services/
│   │   │   ├── api.js               ← Axios instance + JWT interceptor
│   │   │   └── aiService.js         ← Mock AI (no API key needed)
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx                  ← React Router
│   │   ├── index.css                ← Tailwind + custom classes
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/                          # Node.js + Express backend
│   ├── config/
│   │   └── db.js                    ← MongoDB connect with fallback
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   ├── routeController.js
│   │   └── safetyPointController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        ← protect + adminOnly
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── RouteSearch.js
│   │   ├── SafetyPoint.js
│   │   ├── SafetyReport.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── routes.js
│   │   └── safetyPoints.js
│   ├── services/
│   │   ├── aiService.js             ← Gemini/OpenAI + fallback
│   │   └── scoringService.js        ← Weighted safety score formula
│   ├── utils/
│   │   └── seedData.js              ← Sample campus data
│   ├── uploads/                     ← Auto-created for report images
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## 6. Database Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Unique, lowercase |
| password | String | bcrypt hash, never returned |
| studentId | String | Optional |
| role | String | `user` \| `admin` |
| createdAt | Date | Auto |

### SafetyReport
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | Ref → User |
| location | String | Location name |
| latitude / longitude | Number | Coordinates |
| category | String | Poor Lighting \| Isolated Area \| Security Issue \| Road/Path Problem \| Other |
| description | String | Min 10 chars |
| severity | String | Low \| Medium \| High |
| image | String | Upload path (optional) |
| status | String | Pending \| Approved \| Rejected |
| reviewedAt | Date | Set on approve/reject |

### SafetyPoint
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| type | String | CCTV \| Security \| Emergency Point \| Lighting |
| latitude / longitude | Number | Required |
| description | String | Optional |

### RouteSearch
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | Ref → User |
| startLocation | String | Required |
| destination | String | Required |
| travelTime | String | Required |
| selectedRoute | String | Optional |
| safetyScore | Number | 0–100 |

---

## 7. API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/profile` | User | Get own profile |
| PUT | `/api/auth/profile` | User | Update name / studentId |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reports` | User | Submit report (multipart/form-data) |
| GET | `/api/reports` | User | List approved reports |
| GET | `/api/reports/my` | User | Own reports |
| GET | `/api/reports/:id` | User | Single report |
| PUT | `/api/reports/:id` | User | Edit own pending report |
| DELETE | `/api/reports/:id` | User | Delete own report |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/reports` | Admin | All reports (filter + paginate) |
| PUT | `/api/admin/reports/:id/approve` | Admin | Approve report |
| PUT | `/api/admin/reports/:id/reject` | Admin | Reject report |
| DELETE | `/api/admin/reports/:id` | Admin | Delete report |

### Routes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/routes/locations` | User | Campus location list |
| POST | `/api/routes/search` | User | Generate 3 candidate routes with scores |
| POST | `/api/routes/analyze` | User | AI analysis + recommendation |
| GET | `/api/routes/history` | User | Recent route searches |

### Safety Points
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/safety-points` | User | List all safety points |
| POST | `/api/safety-points/seed` | Admin | Seed sample data |
| POST | `/api/safety-points` | Admin | Add point |
| PUT | `/api/safety-points/:id` | Admin | Edit point |
| DELETE | `/api/safety-points/:id` | Admin | Delete point |

---

## 8. How the AI Mock Works

`client/src/services/aiService.js` implements a **rule-based mock** that:

1. Accepts an array of route objects with `lightingQuality`, `securityPointCount`, `approvedReports`, `crowdLevel`, `travelTime`, and `safetyScore`.
2. Waits **800 ms** to simulate network latency.
3. Generates `reasons[]` based on each factor.
4. Marks the highest-scoring route as `recommendation: true`.
5. Returns a structured JSON object matching the SRS Section 6.3 schema exactly.

**No API key is required.** The mock runs entirely in the browser.

When a real `AI_API_KEY` is set in `server/.env`, the backend `services/aiService.js` calls **Gemini** (default) or **OpenAI**, validates the response, and falls back to the rule-based result if the call fails or times out (9 s timeout → SRS requires fallback within 10 s).

---

## 9. How to Run Locally

### Prerequisites
- Node.js v18 or later
- npm v9 or later
- MongoDB (local or Atlas free tier)

### Step 1 — Clone & set up environment

```bash
# From the saferoute-ai/ root
cd server
copy .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/saferoute   # or your Atlas URI
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional — leave blank to use rule-based AI only (no billing)
AI_API_KEY=
AI_PROVIDER=gemini   # or: openai
```

### Step 2 — Install and start the backend

```bash
cd server
npm install
npm run dev          # starts on http://localhost:5000
```

### Step 3 — Install and start the frontend

```bash
# Open a second terminal
cd client
npm install
npm run dev          # starts on http://localhost:5173
```

### Step 4 — Open the app

| URL | Purpose |
|---|---|
| `http://localhost:5173` | Landing page |
| `http://localhost:5173/register` | Student registration |
| `http://localhost:5173/admin/login` | Admin login |
| `http://localhost:5000/api/health` | Backend health check |

---

## 10. How to Deploy

### Frontend → Vercel

```bash
cd client
npm run build        # produces client/dist/

# Push to GitHub, then import in Vercel:
# Build Command:  npm run build
# Output Dir:     dist
# Root Directory: client
```

Add environment variable in Vercel:
```
VITE_API_URL=https://your-backend.onrender.com
```

Then update `client/src/services/api.js` baseURL to use `import.meta.env.VITE_API_URL || '/api'`.

### Backend → Render (free tier)

1. Push to GitHub.
2. New Web Service → connect repo → Root Directory: `server`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, optionally `AI_API_KEY`.

---

## 11. Creating the Admin Account

**Option A — MongoDB Compass / Atlas**

1. Register normally at `/register`.
2. Open your MongoDB database → `users` collection.
3. Find your document and change `"role": "user"` to `"role": "admin"`.
4. Log in at `/admin/login`.

**Option B — Seed script**

```bash
cd server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('admin123', 12);
  await User.findOneAndUpdate(
    { email: 'admin@campus.edu' },
    { name: 'Admin', email: 'admin@campus.edu', password: hash, role: 'admin' },
    { upsert: true }
  );
  console.log('Admin created: admin@campus.edu / admin123');
  process.exit(0);
});
"
```

---

## 12. No API Key Needed

The application runs fully without any paid API:

- **MongoDB**: Use local instance (`mongodb://localhost:27017/saferoute`) — no Atlas account needed.
- **Maps**: OpenStreetMap tiles are free — no Mapbox/Google key.
- **AI**: Leave `AI_API_KEY` blank. The backend falls back to rule-based scoring automatically. The client-side mock AI (`aiService.js`) also works with no key.
- **Images**: Stored locally in `server/uploads/` — no cloud storage needed.

---

## Safety Disclaimer

> SafeRoute AI is a **college-level academic prototype**. Safety scores are **estimates based on available data** and are **not guarantees of real-world safety**. The system is **not** an emergency service, crime prediction tool, or official campus security system. Always exercise personal judgment when navigating campus.

---

*SafeRoute AI · B.Tech CSE Final Year Project · Academic Year 2025–26*
