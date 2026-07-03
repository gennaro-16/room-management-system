# Room Management System

A full-stack meeting-room booking and management platform with real-time room status, conflict detection, role-based access, and an admin approval workflow. Built with **NestJS + Prisma + PostgreSQL** on the backend and **Next.js 14 + TypeScript + Tailwind CSS** on the frontend.

> Originally built to manage meeting rooms for an organization, now generalized and open-sourced as a portfolio project.

**Branding note:** This public release uses a generic identity ("Room Booking System") instead of the original client branding. The original branded version is preserved on the [`branded-client-version`](https://github.com/gennaro-16/room-management-system/tree/branded-client-version) branch for reference only — it is not intended for public deployment. See [BRANDING.md](./BRANDING.md) for details.

---

## Features

- **Room management** — create, edit, and track rooms with capacity, floor, amenities, and live status (free / busy / maintenance / reserved).
- **Booking system** — request bookings with automatic conflict detection so a room can never be double-booked.
- **Conflict resolution** — when a slot is taken, the system suggests alternative rooms and nearby time slots.
- **Roles & permissions** — admin/secretary, employee, and guest roles with an approval workflow for new users and bookings.
- **Departments** — organize rooms and users by department and floor.
- **Dashboard & analytics** — live statistics, today's bookings, and room status overview.
- **Notifications** — in-app updates for booking and approval events.
- **Responsive UI** — works across desktop, tablet, and mobile.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | NestJS 11, Prisma ORM, PostgreSQL, Passport/JWT auth, class-validator, Swagger |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Tooling | Docker & Docker Compose, ESLint, Prettier, Jest |

---

## Repository Structure

```
room-management-system/
├── room-management-backend-nest/   # NestJS + Prisma API
├── room-management-frontend-next/  # Next.js dashboard
├── scripts/                        # deploy / dev helper scripts
├── docker-compose.yml              # local orchestration (db, backend, frontend, redis)
├── docker-compose.prod.yml         # production orchestration (+ nginx)
└── .env.example                    # environment variable template
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Docker)
- npm

### Option A — Docker (recommended)

```bash
git clone https://github.com/<your-username>/room-management-system.git
cd room-management-system

cp .env.example .env      # then edit values (set a real DB password & JWT secret)
docker compose up --build
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API docs (Swagger): http://localhost:3000/api

### Option B — Run locally

**Backend**

```bash
cd room-management-backend-nest
cp env.example .env        # set DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev
npx prisma db seed         # optional sample data
npm run start:dev          # http://localhost:3000
```

**Frontend** (in a second terminal)

```bash
cd room-management-frontend-next
cp env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev                # http://localhost:3001
```

---

## Demo Credentials

After seeding the database, you can log in with:

| Role  | Email           | Password      |
|-------|-----------------|---------------|
| Admin | admin@bank.com  | password123   |

> Seed data is fictional and for local development only. Change these before any real deployment.

---

## Environment Variables

See [`.env.example`](./.env.example). Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Secret used to sign JWTs (use a long random value) |
| `FRONTEND_URL` | Allowed CORS origin for the API |
| `NEXT_PUBLIC_API_URL` | Base URL the frontend uses to reach the API |

**Never commit real secrets.** `.env` files are gitignored.

---

## Documentation

- [Comprehensive documentation](./COMPREHENSIVE_DOCUMENTATION.md)
- [Technical documentation](./TECHNICAL_DOCUMENTATION.md)
- [API documentation](./API_DOCUMENTATION.md)
- [User guide](./USER_GUIDE.md)
- [Docker deployment](./DOCKER_DEPLOYMENT.md)
- [Branding & open-source release](./BRANDING.md)

---

## Screenshots

_Add screenshots of the dashboard, calendar, and booking flow here._

---

## License

Released under the [MIT License](./LICENSE).
