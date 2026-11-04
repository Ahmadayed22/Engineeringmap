# 🗺️ Engineering Map

A web app that helps engineering students plan and get through their degree: an interactive map of every course and its prerequisites, progress tracking, a semester planner, a weekly timetable, exam countdowns, past exams and shared course materials.

The interface is in **Arabic by default (right-to-left)**, with an English switch in the header.

Live: [engmaps.com](https://engmaps.com)

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Running it locally](#running-it-locally)
- [Configuration](#configuration)
- [Tests and checks](#tests-and-checks)
- [Load testing](#load-testing)
- [Deployment](#deployment)
- [API overview](#api-overview)
- [More documentation](#more-documentation)

## Features

### For students
- **Roadmaps (study plans).** One interactive map per program (Computer Engineering, Electrical Engineering, and any roadmap an admin adds). Solid lines are prerequisites, dashed lines co-requisites.
- **Progress.** Mark courses as completed and save grades. Courses you can take now are outlined in green; locked ones are dimmed and show what's missing.
- **Automatic GPA.** Weighted by credit hours from your saved grades, plus a what-if GPA calculator.
- **Course search.** Arabic-aware (ignores أ/إ/ا, ة/ه, ى/ي and diacritics).
- **Semester planner** (`/planner`). Up to 12 semesters per roadmap, with warnings for missing prerequisites and co-requisites and semesters over 18 hours.
- **Weekly timetable** (`/schedule`). Add a class on several days at once. Clashes are listed and drawn side by side. Print it, or save it as a calendar file (`.ics`) that repeats weekly for 16 weeks.
- **Exam countdown** (`/exams`). Your own exam dates with a live countdown, and reminders in the notification bell 3 days before and again on the last day.
- **Past exam bank** (course drawer → "امتحانات سابقة"). Old exam papers per course (PDF or photo, up to 10 MB) with kind, semester, year, doctor and "includes the solution".
- **Course materials.** Links to books, summaries, slides, labs, exams and videos, with helpful/not-helpful votes and a report button.
- **Comments.** Per course, with one level of replies. The original author gets a notification.
- **Course ratings.** Community difficulty and workload (1–5).
- **Share progress** (`/share`). An opt-in, revocable link that shows your username and completed courses.
- **Faculty email directory** and a link to the BankZenon exam library.
- **Installable and works offline.** The app and the study plans are cached by a service worker (API calls are never cached).
- **Signed in on several devices** at the same time.

### For admins (`/admin`)
- **Approval queue.** New past exams and material links from students stay hidden until an admin approves them. Rejecting deletes the upload, and the student is notified either way. Admin uploads are public at once.
- **Reported materials.** Dismiss the report or delete the material.
- **Faculty emails.** Add, edit and remove.
- **Roadmaps** (home page → Settings). Create a roadmap (copy of another or blank), rename, show/hide, reorder, upload a card picture, or remove it.
- **Map editor.** Edit a roadmap's map visually; changes stay a draft until published, with version history and restore.

## Tech stack

| Part | Technology |
|---|---|
| Client | React 19, TypeScript, Vite 6, Tailwind CSS 4, Flowbite React, React Flow (`@xyflow/react`), Redux Toolkit, TanStack Query, Axios, Vitest |
| Server | Java 21, Spring Boot 3.5 (Web, Data JPA, Security, Validation), JWT (jjwt), Flyway |
| Database | PostgreSQL 16 (production and local), H2 in PostgreSQL mode for tests |
| Hosting | One Docker image (Spring Boot serves the built React app) on Render |

## Project structure

```
Engineeringmap/
├── client/                         React app
│   └── src/
│       ├── components/             shared UI (drawer, materials, comments, modals)
│       ├── features/
│       │   ├── map/                roadmaps, map format, map editor
│       │   ├── progress/           prerequisites, GPA, planner, search
│       │   ├── community/          ratings, notification bell
│       │   └── study/              timetable, exam countdown, past exam bank
│       ├── pages/                  one folder per route
│       ├── i18n/                   strings.ts (Arabic + English), serverMessages.ts
│       ├── service/apiClient.ts    base URL, token, refresh on 401
│       └── store/                  Redux auth state
├── server/                         Spring Boot API
│   └── src/
│       ├── main/java/com/engineeringmap/server/
│       │   ├── controller/  service/  repo/  entity/  dto/
│       │   ├── security/           SecurityConfig, JWT filter
│       │   └── exception/          one JSON error shape
│       ├── main/resources/db/migration/   Flyway scripts (V1…V8)
│       └── test/                   MockMvc tests on H2 (+ demo data)
├── tools/loadtest/                 load test and its cleanup script
├── docs/PRODUCTION_AUDIT.md        audit, decisions and change log
├── Dockerfile                      builds client + server into one image
└── docker-compose.yml
```

## Running it locally

### Prerequisites
- Java 21 (the Maven wrapper `server/mvnw` is included)
- Node.js 20+
- Docker (for PostgreSQL), or a local PostgreSQL 16

### 1. Start PostgreSQL

```bash
docker run -d --name engmap-db -e POSTGRES_PASSWORD=change-me -e POSTGRES_DB=engineeringmap -p 55432:5432 postgres:16-alpine
```

### 2. Start the API

The server reads its settings from environment variables (see [Configuration](#configuration)). For example, in Git Bash:

```bash
cd server
export DATABASE_URL=jdbc:postgresql://localhost:55432/engineeringmap
export DB_USERNAME=postgres
export DB_PASSWORD=change-me
export JWT_SECRET=$(openssl rand -base64 48)
export PORT=8090
./mvnw spring-boot:run
```

On first start Flyway creates every table and the `USER`/`ADMIN` roles. Course rows are not seeded, so insert your courses before using the maps.

**No PostgreSQL?** Run the API on an in-memory H2 database with demo courses (test classpath only):

```bash
cd server
./mvnw spring-boot:run -Dspring-boot.run.useTestClasspath=true -Dspring-boot.run.profiles=local
```

### 3. Start the client

```bash
cd client
npm install
VITE_API_URL=http://localhost:8090 npm run dev
```

Open http://localhost:5173. If you change the API port, also add the client's address to `APP_CORS_ALLOWED_ORIGINS` (see below).

### 4. Make yourself an admin

There is no UI for granting the admin role. Sign up, then in the database:

```sql
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'your-username' AND r.name = 'ADMIN';
```

Roles are read from the access token, so sign out and in again (or wait up to 15 minutes) for the change to apply.

## Configuration

### Server (environment variables)

| Variable | Required | Meaning |
|---|---|---|
| `DATABASE_URL` | yes | JDBC URL, e.g. `jdbc:postgresql://host:5432/engineeringmap` |
| `DB_USERNAME`, `DB_PASSWORD` | yes | Database credentials |
| `JWT_SECRET` | yes | Base64 signing key, at least 32 random bytes. Never commit it. |
| `PORT` | no | HTTP port (default `8080`) |
| `JWT_ACCESS_EXPIRATION` | no | Access token lifetime in ms (default 15 min) |
| `JWT_REFRESH_EXPIRATION` | no | Refresh token lifetime in ms (default 7 days) |
| `APP_CORS_ALLOWED_ORIGINS` | no | Comma-separated client origins (defaults cover localhost:5173 and the production domains) |

The schema is owned by Flyway; Hibernate only validates it (`ddl-auto=validate`). Change the schema with a new `server/src/main/resources/db/migration/V<n>__*.sql` file. Don't set `SPRING_JPA_HIBERNATE_DDL_AUTO`.

Uploads: past exam files up to 10 MB (multipart limit 11 MB), roadmap pictures up to 2 MB. Both are stored in PostgreSQL.

### Client

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | API base URL. Empty string when Spring Boot serves the React build (same origin). Unset falls back to the Render URL. |

## Tests and checks

```bash
# Server: MockMvc + Flyway on H2, no PostgreSQL needed
cd server
./mvnw test

# Client
cd client
npm test          # Vitest
npx tsc -b        # type check
npm run lint      # ESLint
npm run build     # production build
```

Every interface string lives in `client/src/i18n/strings.ts`. The Arabic table is typed against the English one, so a missing translation fails the type check.

## Load testing

`tools/loadtest/loadtest.mjs` needs only Node 18+. It runs anonymous reads, sign-up, a sign-in burst, signed-in students (with and without pauses) and 2 MB uploads. **Only point it at a local or staging server you own.**

```bash
node tools/loadtest/loadtest.mjs all --base=http://localhost:8090 --users=300
docker exec -i engmap-db psql -U postgres -d engineeringmap < tools/loadtest/cleanup.sql
```

The second command removes the `lt_<n>` test users. On a development PC the API served 1,000 signed-in students with no errors. The full results are in section 15 of the audit doc.

## Deployment

The `Dockerfile` builds the React app, copies it into Spring Boot's static folder and produces one runnable JAR (port 8080). On Render, set the server environment variables above. Flyway applies new migrations automatically on start-up; databases created before Flyway are baselined at version 1.

## API overview

All endpoints are under `/api`. Errors are always `{"message": "..."}`. Reads of maps, courses, comments, materials, ratings and approved past exams are public. Everything else needs a signed-in user (`Authorization: Bearer <accessToken>`), and `/api/admin/**` needs the admin role.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `/auth/signin`, `/auth/refresh`, `/auth/logout` |
| Roadmaps & maps | `GET /plans`, `GET /maps/{plan}`, `GET /plans/{slug}/image`; admin: `POST/PUT/DELETE /admin/plans…`, `PUT /admin/maps/{plan}`, versions and restore |
| Courses & progress | `GET /courses`, `/courses/{id}`, `/courses/search`; `POST /courses/{id}/complete`, `/courses/{id}/mark`; `GET /courses/user/completed`, `/courses/user/marks/batch` |
| Comments | `GET /comments/course/{courseId}`; `POST /comments` (with optional `parentId`); `PUT/DELETE /comments/{id}` |
| Materials | `GET /resource/course/{courseId}`; `POST /resource/course/{courseId}`; `PUT/DELETE /resource/{id}`; `POST /resource/{id}/vote`, `/resource/{id}/report` |
| Past exams | `GET /past-exams/course/{courseId}`, `GET /past-exams/{id}/file`; `POST /past-exams/course/{courseId}` (multipart); `DELETE /past-exams/{id}` |
| Timetable | `GET/PUT /timetable` |
| Exam dates | `GET/POST /exam-dates`, `PUT/DELETE /exam-dates/{id}` |
| Planner | `GET/PUT /planner?plan={slug}` |
| Ratings | `GET /courses/{id}/ratings`, `PUT /courses/{id}/rating` |
| Notifications | `GET /notifications`, `/notifications/unread-count`; `POST /notifications/read-all`, `/notifications/{id}/read` |
| Sharing | `GET/POST/DELETE /users/me/share`, `GET /share/{token}` |
| Faculty emails | `GET /dremails`; admin: `POST/PUT/DELETE /dremails…` |
| Admin review | `GET /admin/materials/pending`, `/admin/past-exams/pending`; `POST /admin/{materials\|past-exams}/{id}/approve\|reject`; `GET /admin/reports`, `POST /admin/reports/{id}/resolve` |

## More documentation

[`docs/PRODUCTION_AUDIT.md`](docs/PRODUCTION_AUDIT.md) holds the security audit, the decisions behind each feature, what was verified, and the open backlog (rate limiting on sign-in, httpOnly refresh cookie, removing unused dependencies, password reset by email).

## Author

**Ahmad Ayed** ([@Ahmadayed22](https://github.com/Ahmadayed22))
