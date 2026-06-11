# CarbonVerse AI - Sustainability Platform

<p align="center">
  <strong>Your Carbon Journey Starts Here</strong><br>
  Track, understand, and reduce your environmental impact with AI-powered insights
</p>

## Live Demo

**Frontend:** https://carbonverse-ai.vercel.app

**Backend API:** https://carbonverse-api.onrender.com/api/v1/docs

[![Deploy Backend to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/siddhant19saraf-spec/carbonverse-ai)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js 15)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Dashboard │  │Calculator│  │ AI Coach │  │ Reports │  │
│  └─────┬─────┘  └─────┬────┘  └─────┬────┘  └────┬────┘  │
│        └───────────────┴────────────┴────────────┘        │
│                           │ API Client (fetch)            │
└───────────────────────────┼───────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────┐
│                    SERVER (FastAPI)                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │              API Layer (v1/endpoints)              │   │
│  │  auth │ users │ emissions │ coach │ predictions    │   │
│  │  achievements │ challenges │ goals │ reports │ admin│   │
│  └─────────────────────┬──────────────────────────────┘   │
│  ┌─────────────────────┴──────────────────────────────┐   │
│  │             Service Layer (business logic)          │   │
│  │  AuthService │ EmissionService │ CoachService       │   │
│  │  PredictionService │ GamificationService            │   │
│  │  ReportService │ AdminService                       │   │
│  └─────────────────────┬──────────────────────────────┘   │
│  ┌─────────────────────┴──────────────────────────────┐   │
│  │          Repository Layer (data access)            │   │
│  │  UserRepository │ EmissionRepository                │   │
│  │  AchievementRepository │ ChallengeRepository        │   │
│  │  SustainabilityGoalRepository │ AuditLogRepository  │   │
│  └─────────────────────┬──────────────────────────────┘   │
│  ┌─────────────────────┴──────────────────────────────┐   │
│  │           Models (SQLAlchemy 2.0 ORM)              │   │
│  │  User │ EmissionRecord │ Achievement                │   │
│  │  Challenge │ SustainabilityGoal │ AuditLog          │   │
│  └─────────────────────┬──────────────────────────────┘   │
│                        │                                   │
│  ┌─────────────────────┴──────────────────────────────┐   │
│  │                PostgreSQL 16                         │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js, React, TypeScript | 15, 19, 5.7 |
| UI | Tailwind CSS, Shadcn UI, Framer Motion | 3.4, Radix, 11 |
| Charts | Recharts | 2.15 |
| Forms | React Hook Form, Zod | 7.54, 3.24 |
| Backend | FastAPI, Python | 0.115, 3.12 |
| ORM | SQLAlchemy, Alembic | 2.0, 1.14 |
| Auth | JWT (jose), bcrypt (passlib) | 3.3, 1.7 |
| PDF | ReportLab | 4.2 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Testing | Pytest, Jest, Playwright | 8.3, 29, 1.50 |
| Deployment | Docker, GitHub Actions | - |

## Features

### 1. Smart Carbon Calculator
- Track emissions from 5 categories: Transportation, Food, Electricity, Water, Waste
- Detailed subcategory breakdown (e.g., car, bus, train for transportation)
- Real-time carbon footprint calculation using scientifically-backed factors
- Category-level suggestions for reduction

### 2. AI Sustainability Coach
- Rule-based contextual advice engine
- Analyzes user emissions patterns
- Generates weekly sustainability insights
- Daily rotating sustainability tips
- Personalized reduction goals

### 3. Carbon Prediction Engine
- Linear regression-based forecasting
- Configurable prediction windows (1-12 months)
- Confidence intervals and trend analysis
- Projected sustainability scores

### 4. Sustainability Dashboard
- KPI cards with animated counters
- Emission trends (area chart)
- Category breakdown (donut chart)
- Circular sustainability score gauge
- National average comparison

### 5. Sustainability Score System
- 0-100 score based on emissions vs. national averages
- 5 levels: Excellent, Good, Average, Below Average, Needs Improvement
- Progress tracking over time

### 6. Gamification
- Achievement badges (10+ categories)
- Green levels (1-5)
- Streak tracking (consecutive days)
- Weekly challenges with rewards
- Progress visualization

### 7. Report Generator
- PDF reports with emission summary
- Category breakdown tables
- Sustainability score visualization
- Personalized recommendations
- Date range selection

### 8. Admin Dashboard
- User analytics (total, active, new, verified)
- Platform metrics (emissions, scores, achievements)
- Emission analytics by category
- System health monitoring

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Docker (Recommended)

```bash
git clone https://github.com/your-org/carbonverse-ai.git
cd carbonverse-ai
docker compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/v1/docs

### Manual Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Create account | No |
| POST | `/api/v1/auth/login` | Get tokens | No |
| POST | `/api/v1/auth/refresh` | Refresh token | No |
| GET | `/api/v1/auth/me` | Current user | Yes |
| POST | `/api/v1/auth/change-password` | Change password | Yes |
| GET | `/api/v1/users/me` | Get profile | Yes |
| PATCH | `/api/v1/users/me` | Update profile | Yes |
| POST | `/api/v1/emissions/` | Record emission | Yes |
| GET | `/api/v1/emissions/` | List emissions | Yes |
| GET | `/api/v1/emissions/summary` | Emission summary | Yes |
| GET | `/api/v1/emissions/score` | Carbon score | Yes |
| GET | `/api/v1/emissions/compare-national` | National comparison | Yes |
| POST | `/api/v1/coach/chat` | AI coach chat | Yes |
| GET | `/api/v1/coach/daily-tip` | Daily tip | No |
| GET | `/api/v1/coach/weekly-insights` | Weekly insights | Yes |
| POST | `/api/v1/predictions/` | Predictions | Yes |
| GET | `/api/v1/achievements/state` | Gamification state | Yes |
| GET | `/api/v1/challenges/` | Active challenges | Yes |
| GET | `/api/v1/goals/` | User goals | Yes |
| POST | `/api/v1/goals/` | Create goal | Yes |
| POST | `/api/v1/reports/generate` | Generate report | Yes |
| POST | `/api/v1/reports/download` | Download PDF | Yes |
| GET | `/api/v1/admin/user-analytics` | Admin: users | Yes (Admin) |
| GET | `/api/v1/admin/platform-metrics` | Admin: metrics | Yes (Admin) |
| GET | `/api/v1/admin/emission-analytics` | Admin: emissions | Yes (Admin) |
| GET | `/api/v1/admin/system-health` | Admin: health | Yes (Admin) |

## Testing

```bash
# Backend unit tests
cd backend
python -m pytest tests/ -v --cov=app --cov-report=html

# Frontend unit tests
cd frontend
npm run test:coverage

# E2E tests
npx playwright test
```

## Security

- JWT authentication with access + refresh tokens
- bcrypt password hashing (12 rounds)
- Role-based access control (user, moderator, admin)
- Rate limiting (sliding window via Redis)
- Security headers (HSTS, CSP, X-Frame-Options, X-XSS-Protection)
- Input validation (Pydantic schemas + Zod)
- SQL injection prevention (SQLAlchemy ORM)
- CORS protection (configurable origins)
- Audit logging for all mutations
- Request timing and logging middleware

## Accessibility (WCAG 2.1 AA)

- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader support (sr-only text)
- High contrast mode support
- Reduced motion support (prefers-reduced-motion)
- Form labels and error announcements

## Performance

- Server Components for static content
- Dynamic imports for heavy components
- Code splitting
- API response caching
- Lazy loading of charts
- Optimized bundle (tree-shaking)
- Request timeouts (30s default)
- Redis connection pooling

## Project Structure

```
carbonverse-ai/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/v1/            # API endpoints (10 modules)
│   │   ├── core/              # Config, security, database, deps
│   │   ├── models/            # SQLAlchemy models (6 models)
│   │   ├── schemas/           # Pydantic schemas (11 modules)
│   │   ├── repositories/      # Data access layer (7 repos)
│   │   ├── services/          # Business logic (7 services)
│   │   ├── utils/             # Validation utilities
│   │   └── main.py            # Application entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Backend tests (40+ tests)
│   └── requirements.txt
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/               # App Router pages (13 pages)
│       │   ├── (auth)/        # Login, Register
│       │   └── (dashboard)/   # Dashboard, Calculator, etc.
│       ├── components/        # React components
│       │   ├── ui/            # Shadcn UI (16 components)
│       │   ├── layout/        # Sidebar, Header, Layout
│       │   ├── dashboard/     # KPI, Charts, Score
│       │   ├── calculator/    # Form, Result, Tip
│       │   ├── coach/         # Chat, Insights
│       │   ├── charts/        # Prediction, Comparison
│       │   ├── gamification/  # Level, Streak, Challenges
│       │   ├── reports/       # Report Generator
│       │   └── admin/         # Analytics, Users
│       ├── hooks/             # Custom hooks (useAuth)
│       ├── lib/               # API client, utils, validators
│       ├── providers/         # Auth, Theme providers
│       ├── types/             # TypeScript types
│       └── styles/            # Global CSS
├── e2e/                        # Playwright E2E tests
├── docker/                     # Dockerfiles
├── .github/workflows/          # CI/CD pipeline
├── docs/                       # Documentation
├── docker-compose.yml          # Docker Compose
└── README.md
```

## License

MIT
