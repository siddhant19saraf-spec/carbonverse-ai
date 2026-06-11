# CarbonVerse AI - Project Document

---

## 1. Project Overview

**CarbonVerse AI** is a production-ready, AI-powered Carbon Footprint Awareness Platform that helps users track, understand, and reduce their environmental impact.

### Key Features

| Feature | Description |
|---------|-------------|
| Smart Carbon Calculator | Track emissions from transportation, food, electricity, water, waste |
| AI Sustainability Coach | Personalized advice, weekly insights, daily tips |
| Carbon Prediction Engine | Forecast future emissions with trend analysis |
| Sustainability Dashboard | KPIs, charts, category breakdowns, score gauge |
| Gamification | Achievement badges, green levels, streaks, weekly challenges |
| Report Generator | Downloadable PDF sustainability reports |
| Admin Dashboard | Platform metrics, user analytics, system health |
| National Comparison | Compare footprint against national averages |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js, React, TypeScript | 15, 19, 5.7 |
| UI Library | Tailwind CSS, Shadcn UI, Framer Motion | 3.4, Radix, 11 |
| Charts | Recharts | 2.15 |
| Forms | React Hook Form, Zod | 7.54, 3.24 |
| Backend | FastAPI, Python | 0.115, 3.12 |
| ORM | SQLAlchemy, Alembic | 2.0, 1.14 |
| Auth | JWT (jose), bcrypt (passlib) | 3.3, 1.7 |
| PDF Generation | ReportLab | 4.2 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Testing | Pytest, Jest, Playwright | 8.3, 29, 1.50 |
| Deployment | Docker, Docker Compose, GitHub Actions | - |

---

## 3. Architecture

```
carbonverse-ai/
├── backend/                    # FastAPI Application
│   ├── app/
│   │   ├── api/v1/            # API Endpoints (10 modules)
│   │   │   ├── auth.py        # Authentication (register, login, refresh, me)
│   │   │   ├── users.py       # User profile management
│   │   │   ├── emissions.py   # Carbon emission tracking
│   │   │   ├── coach.py       # AI Sustainability Coach
│   │   │   ├── predictions.py # Carbon prediction engine
│   │   │   ├── achievements.py# Gamification state
│   │   │   ├── challenges.py  # Weekly challenges
│   │   │   ├── goals.py       # Sustainability goals
│   │   │   ├── reports.py     # PDF report generation
│   │   │   └── admin.py       # Admin dashboard endpoints
│   │   ├── core/              # Core Configuration
│   │   │   ├── config.py      # App settings (env-based)
│   │   │   ├── database.py    # SQLAlchemy engine + session
│   │   │   ├── deps.py        # Dependency injection (auth, rate limiter)
│   │   │   └── security.py    # JWT tokens, password hashing
│   │   ├── models/            # SQLAlchemy Models (6 models)
│   │   │   ├── user.py        # User model (UUID PK, roles, scores)
│   │   │   ├── emission.py    # EmissionRecord model
│   │   │   ├── achievement.py # Achievement + UserAchievement models
│   │   │   ├── challenge.py   # Challenge + UserChallenge models
│   │   │   ├── sustainability_goal.py # Goal tracking model
│   │   │   └── audit_log.py   # Audit logging model
│   │   ├── schemas/           # Pydantic Schemas (11 modules)
│   │   ├── repositories/      # Data Access Layer (7 repositories)
│   │   ├── services/          # Business Logic (7 services)
│   │   ├── utils/             # Validation utilities
│   │   └── main.py            # Application entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Backend tests (40+ tests)
│   ├── requirements.txt       # Python dependencies
│   ├── pytest.ini             # Test configuration
│   └── .env.example           # Environment template
├── frontend/                   # Next.js Application
│   └── src/
│       ├── app/               # App Router Pages (13 pages)
│       │   ├── layout.tsx     # Root layout with providers
│       │   ├── page.tsx       # Landing page
│       │   ├── globals.css    # Global styles + CSS variables
│       │   ├── (auth)/        # Auth route group
│       │   │   ├── layout.tsx # Centered auth layout
│       │   │   ├── login/     # Login page
│       │   │   └── register/  # Registration page
│       │   └── (dashboard)/   # Dashboard route group
│       │       ├── layout.tsx # Dashboard layout with auth guard
│       │       ├── dashboard/ # Main dashboard
│       │       ├── calculator/# Carbon calculator
│       │       ├── coach/     # AI Coach interface
│       │       ├── predictions/# Prediction engine
│       │       ├── reports/   # Report generator
│       │       ├── achievements/# Gamification
│       │       ├── admin/     # Admin dashboard
│       │       └── settings/  # User settings
│       ├── components/        # React Components
│       │   ├── ui/            # Shadcn UI primitives (16)
│       │   ├── layout/        # Layout components (4)
│       │   ├── dashboard/     # Dashboard components (5)
│       │   ├── calculator/    # Calculator components (3)
│       │   ├── coach/         # AI Coach components (2)
│       │   ├── charts/        # Chart components (2)
│       │   ├── gamification/  # Gamification components (4)
│       │   ├── reports/       # Report components (1)
│       │   └── admin/         # Admin components (2)
│       ├── hooks/             # Custom hooks
│       │   └── useAuth.ts     # Authentication hook with refresh
│       ├── lib/               # Utilities
│       │   ├── api.ts         # API client with timeout + error handling
│       │   ├── utils.ts       # Utility functions (cn, formatCarbon, etc.)
│       │   └── validators.ts  # Zod schemas for forms
│       ├── providers/         # Context Providers
│       │   ├── AuthProvider.tsx # Authentication context
│       │   └── ThemeProvider.tsx # Theme provider (backup)
│       ├── types/             # TypeScript types
│       └── styles/            # Global CSS
│   ├── tests/                 # Frontend tests (11 test suites)
│   ├── package.json           # Node dependencies
│   ├── tsconfig.json          # TypeScript config
│   ├── tailwind.config.js     # Tailwind configuration
│   └── .env.example           # Frontend env template
├── e2e/                        # End-to-End Tests
│   ├── playwright.config.ts   # Playwright configuration
│   └── tests/                 # E2E test specs
├── docker/                     # Docker Configuration
│   ├── Dockerfile.backend     # Backend Docker image
│   └── Dockerfile.frontend    # Frontend Docker image
├── .github/workflows/          # CI/CD Pipeline
│   └── ci.yml                 # GitHub Actions workflow
├── docs/                       # Documentation
│   ├── DATABASE_SCHEMA.md     # Database schema reference
│   └── DEPLOYMENT.md          # Deployment guide
├── docker-compose.yml          # Docker Compose orchestration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 4. Database Schema

### Tables

#### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NULLABLE |
| role | VARCHAR(20) | DEFAULT 'user' |
| is_active | BOOLEAN | DEFAULT true |
| is_verified | BOOLEAN | DEFAULT false |
| sustainability_score | INTEGER | DEFAULT 0 |
| carbon_saved | FLOAT | DEFAULT 0.0 |
| green_level | INTEGER | DEFAULT 1 |
| streak_days | INTEGER | DEFAULT 0 |
| avatar_url | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMP(tz) | NOT NULL |
| updated_at | TIMESTAMP(tz) | NOT NULL |

#### emission_records
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK -> users.id |
| category | VARCHAR(50) | NOT NULL |
| subcategory | VARCHAR(50) | NULLABLE |
| amount | FLOAT | NOT NULL |
| unit | VARCHAR(20) | NOT NULL |
| carbon_footprint | FLOAT | NOT NULL |
| recorded_at | TIMESTAMP(tz) | NOT NULL |
| created_at | TIMESTAMP(tz) | NOT NULL |

#### achievements
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| description | VARCHAR(500) | NOT NULL |
| badge_icon | VARCHAR(10) | NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| threshold_score | INTEGER | NOT NULL |
| created_at | TIMESTAMP(tz) | NOT NULL |

#### challenges
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| description | VARCHAR(500) | NOT NULL |
| goal_type | VARCHAR(50) | NOT NULL |
| goal_value | FLOAT | NOT NULL |
| reward_score | INTEGER | NOT NULL |
| starts_at | TIMESTAMP(tz) | NOT NULL |
| ends_at | TIMESTAMP(tz) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP(tz) | NOT NULL |

#### sustainability_goals
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK -> users.id |
| title | VARCHAR(200) | NOT NULL |
| description | VARCHAR(500) | NOT NULL |
| target_carbon_reduction | FLOAT | NOT NULL |
| current_reduction | FLOAT | DEFAULT 0.0 |
| category | VARCHAR(50) | NOT NULL |
| target_date | DATE | NOT NULL |
| is_completed | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP(tz) | NOT NULL |
| updated_at | TIMESTAMP(tz) | NOT NULL |

#### audit_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK -> users.id, NULLABLE |
| action | VARCHAR(100) | NOT NULL |
| resource | VARCHAR(100) | NOT NULL |
| resource_id | VARCHAR(255) | NULLABLE |
| details | JSONB | NULLABLE |
| ip_address | VARCHAR(45) | NULLABLE |
| user_agent | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMP(tz) | NOT NULL |

### Relationships

```
users 1:N emission_records
users N:N achievements (through user_achievements)
users N:N challenges (through user_challenges)
users 1:N sustainability_goals
users 1:N audit_logs
```

---

## 5. API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Create new account | No |
| POST | `/api/v1/auth/login` | Get access + refresh tokens | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| POST | `/api/v1/auth/change-password` | Change password | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/me` | Get user profile | Yes |
| PATCH | `/api/v1/users/me` | Update user profile | Yes |

### Emissions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/emissions/` | Record emission | Yes |
| GET | `/api/v1/emissions/` | List user emissions | Yes |
| GET | `/api/v1/emissions/summary` | Get emission summary | Yes |
| GET | `/api/v1/emissions/score` | Get carbon score | Yes |
| GET | `/api/v1/emissions/compare-national` | Compare to national avg | Yes |

### AI Coach

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/coach/chat` | Chat with AI coach | Yes |
| GET | `/api/v1/coach/daily-tip` | Get daily tip | No |
| GET | `/api/v1/coach/weekly-insights` | Get weekly insights | Yes |
| GET | `/api/v1/coach/goals` | Get AI-generated goals | Yes |

### Predictions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/predictions/` | Generate predictions | Yes |

### Gamification

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/achievements/state` | Get gamification state | Yes |
| GET | `/api/v1/challenges/` | Get active challenges | Yes |

### Goals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/goals/` | Get user goals | Yes |
| POST | `/api/v1/goals/` | Create new goal | Yes |

### Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/reports/generate` | Generate PDF report | Yes |
| POST | `/api/v1/reports/download` | Download PDF report | Yes |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/user-analytics` | User analytics | Yes (Admin) |
| GET | `/api/v1/admin/platform-metrics` | Platform metrics | Yes (Admin) |
| GET | `/api/v1/admin/emission-analytics` | Emission analytics | Yes (Admin) |
| GET | `/api/v1/admin/system-health` | System health | Yes (Admin) |

---

## 6. Carbon Conversion Factors

### Transportation (kg CO2 per km)

| Mode | Factor |
|------|--------|
| Car | 0.21 |
| Bus | 0.09 |
| Train | 0.04 |
| Flight | 0.25 |
| Motorcycle | 0.15 |
| EV | 0.05 |
| Bike | 0.00 |
| Walk | 0.00 |

### Food (kg CO2 per kg)

| Type | Factor |
|------|--------|
| Meat | 7.0 |
| Dairy | 2.5 |
| Seafood | 3.5 |
| Processed | 3.0 |
| Grains | 0.8 |
| Fruit | 0.6 |
| Vegetables | 0.5 |
| Plant-based | 0.3 |

### Energy

| Type | Factor |
|------|--------|
| Electricity (grid) | 0.50 per kWh |
| Solar | 0.02 per kWh |
| Wind | 0.01 per kWh |
| Natural Gas | 0.40 per kWh |
| Water (cold) | 0.001 per liter |
| Water (hot) | 0.003 per liter |

### Waste (kg CO2 per kg)

| Type | Factor |
|------|--------|
| Landfill | 0.50 |
| Recycled | 0.10 |
| Composted | 0.05 |

### National Averages (kg CO2 per day)

| Category | Average |
|----------|---------|
| Transportation | 4.2 |
| Food | 2.8 |
| Electricity | 3.5 |
| Water | 0.5 |
| Waste | 1.2 |
| **Total** | **12.2** |

---

## 7. Security

| Feature | Implementation |
|---------|---------------|
| JWT Authentication | Access tokens (30min) + Refresh tokens (7 days) |
| Password Hashing | bcrypt with 12 rounds |
| Role-Based Access | user, moderator, admin roles |
| Rate Limiting | Sliding window via Redis (100 req/min) |
| Security Headers | HSTS, CSP, X-Frame-Options, X-XSS-Protection |
| CORS | Configurable origins |
| Input Validation | Pydantic (backend) + Zod (frontend) |
| SQL Injection Prevention | SQLAlchemy ORM parameterized queries |
| Audit Logging | All mutations logged with IP + user agent |
| Request Logging | Method, path, status code logged |
| Global Exception Handler | Catches unhandled errors, returns 500 |
| Request Timeout | 30s default via AbortController |

---

## 8. Accessibility (WCAG 2.1 AA)

| Feature | Implementation |
|---------|---------------|
| Semantic HTML | `<nav>`, `<main>`, `<section>`, `<header>` |
| ARIA Labels | On all interactive elements |
| Keyboard Navigation | Full tab order, Enter/Space activation |
| Focus Indicators | Visible focus rings on all focusable elements |
| Screen Reader Support | sr-only text for loading states |
| Color Contrast | Meets 4.5:1 ratio for normal text |
| Reduced Motion | `prefers-reduced-motion` media query support |
| Form Labels | All inputs have associated `<label>` elements |
| Error Announcements | Form errors announced to screen readers |

---

## 9. Performance

| Feature | Implementation |
|---------|---------------|
| Server Components | Used for static content (landing page) |
| Dynamic Imports | Heavy charts loaded on demand |
| Code Splitting | Automatic via Next.js App Router |
| Lazy Loading | Charts and heavy components deferred |
| Request Timeouts | 30s AbortController prevents hangs |
| Redis Connection Pooling | Shared client instance |
| Database Connection Pool | SQLAlchemy pool_size=10, max_overflow=20 |
| Image Optimization | Next.js Image component |
| Bundle Tree Shaking | Automatic via webpack |

---

## 10. Testing

### Backend Tests (40+)

| Test File | Coverage |
|-----------|----------|
| `test_api.py` | Auth, emissions, coach, predictions, gamification, goals, reports |
| `test_services.py` | EmissionService, CoachService, GamificationService, PredictionService |

### Frontend Tests (11 suites)

| Test File | Coverage |
|-----------|----------|
| `utils.test.ts` | cn, formatCarbon, getScoreColor, getScoreLabel, getCategoryIcon |
| `validators.test.ts` | loginSchema, registerSchema, emissionSchema |
| `button.test.tsx` | Button variants, sizes, disabled state |
| `card.test.tsx` | Card, CardHeader, CardTitle, CardDescription |
| `badge.test.tsx` | Badge variants |
| `input.test.tsx` | Input rendering, events, disabled state |
| `useAuth.test.ts` | Hook initialization, session loading |

### E2E Tests

| Test File | Coverage |
|-----------|----------|
| `auth.spec.ts` | Landing page, navigation, form validation |
| `dashboard.spec.ts` | Auth redirect |

### Running Tests

```bash
# Backend
cd backend
python -m pytest tests/ -v --cov=app

# Frontend
cd frontend
npm run test:coverage

# E2E
npx playwright test
```

---

## 11. Setup Instructions

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Option 1: Docker (Recommended)

```bash
cd carbonverse-ai
docker compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/api/v1/docs
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

---

## 12. Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| POSTGRES_SERVER | localhost | Database host |
| POSTGRES_PORT | 5432 | Database port |
| POSTGRES_USER | carbonverse | Database user |
| POSTGRES_PASSWORD | carbonverse_secret | Database password |
| POSTGRES_DB | carbonverse | Database name |
| SECRET_KEY | (required) | JWT signing key (min 32 chars) |
| REDIS_URL | redis://localhost:6379/0 | Redis connection URL |
| CORS_ORIGINS | ["http://localhost:3000"] | Allowed origins |
| ENVIRONMENT | development | Environment mode |
| LOG_LEVEL | INFO | Logging level |

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:8000/api/v1 | Backend API URL |

---

## 13. Deployment

### Docker Production

```bash
# Create production env
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Build and start
docker compose -f docker-compose.yml up -d --build

# Run migrations
docker compose exec backend alembic upgrade head
```

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

### GitHub Actions

The CI/CD pipeline runs on push to `main` or `develop`:
1. Backend tests with PostgreSQL service
2. Frontend lint and type check
3. Docker image build

---

## 14. File Statistics

| Category | Count |
|----------|-------|
| Backend Python files | 59 |
| Frontend TypeScript/React files | 62 |
| Test files | 11 |
| Config files | 15 |
| Documentation files | 5 |
| **Total source files** | **152** |

| Metric | Value |
|--------|-------|
| Total lines of code | 23,137 |
| API endpoints | 26 |
| Database models | 6 |
| React components | 30+ |
| Pages | 13 |
| UI primitives | 16 |

---

## 15. License

MIT
