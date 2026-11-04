# Engineering Map — Production Readiness Audit

_Audit date: 2026-11-04. Scope: `client/` (React 19 + Vite + Redux Toolkit + React Query + Flowbite + React Flow) and `server/` (Spring Boot 3.5, Spring Security + JWT, JPA/PostgreSQL)._

## 1. Assessment

**What works well.** The core idea is strong and the product has a clear audience: an interactive prerequisite map for the CPE and EE study plans, with per-course discussion, shared materials, grades and completion tracking. The code is organized by feature, uses modern libraries (React Query with optimistic updates, typed Redux hooks, zod forms, Java records as DTOs), and the server keeps controllers, services, mappers and repositories in separate layers.

**What held it back from production.**

- **Security was effectively switched off.** `SecurityConfig` had `"/**"` in its `permitAll` list, so every rule after it did nothing. Anyone, without logging in, could `DELETE /api/courses/{id}` (which cascades and deletes all of that course's comments and materials) and create, edit or delete faculty emails. Endpoints that needed a user only "worked" because the controller threw a `NullPointerException` (HTTP 500) when the principal was missing.
- **Secrets and personal data leaked.** A real database password was committed in `application.properties` (as a comment). `GET /api/users/{id}` was public and returned every user's email. Login replied "User not found" or "Invalid password" separately, which lets anyone check whether an email is registered.
- **Fragile authentication.** Any expired or malformed token made the JWT filter throw, so even public pages failed with a 500 once a stored token expired. On reload, an expired access token logged the user out even though their 7-day refresh token was still valid, so users were effectively signed out every 15 minutes of inactivity. "Sign out" only cleared the browser and never revoked the refresh token on the server. 15 different hooks attached a captured `Bearer ${accessToken}` by hand, so after a refresh they kept sending the stale token, and nothing retried a request after a 401.
- **Validation gaps.** `@Valid` was on the path variable instead of the body in `PUT /api/comments/{id}`, so blank or oversized edits were accepted. Marks accepted any 1–2 characters. Faculty-email paging accepted any `size` (the whole table in one request) and any `sortBy` (a 500 on an unknown field).
- **Performance.** The entry bundle was 1,038 KB (262 KB gzipped). It included every Lottie animation (about 260 KB of JSON), because the Suspense fallback rendered `LottieHandler`, and about 140 KB of tsparticles came in through a component index file even though particles are never shown. Each comment made its own `/api/users/{id}` request just to show the author's name.
- **Inconsistent UX.** The drawer header showed internal keys (`digitalLogic`) instead of the course name. Tabs were labelled "CommentSection" / "AddMark" and didn't show which one was selected. The "Login to Comment" button was disabled and went nowhere. Admins saw an Edit button the server would always reject. Form labels weren't linked to their inputs, the placeholder was a personal email address, and there was no 404 route and no link between sign-in and sign-up.

## 2. The 10 most important improvements

| # | Improvement | Status |
|---|---|---|
| 1 | Enforce authorization: public reads only; writes need a login; catalogue changes need ADMIN | **Done** |
| 2 | Remove the leaked DB password **and rotate it** (it's still in git history) | Removed from file; **you must rotate** |
| 3 | Stop exposing user emails; use one login error message | **Done** |
| 4 | Make auth resilient: tolerant JWT filter, 401 + automatic refresh, server-side logout | **Done** |
| 5 | Consistent JSON errors (`{"message": …}`) and correct status codes (400/401/403/404) | **Done** |
| 6 | Validate input on the server (marks, comment edits, refresh token, paging) | **Done** |
| 7 | Cut the entry bundle: lazy Lottie, drop particles from the eager graph | **Done** (−56%) |
| 8 | Move refresh tokens to an httpOnly cookie (protects against XSS token theft) | Needs your decision |
| 9 | Replace `ddl-auto=update` with Flyway migrations and seed roles (a fresh DB can't register users today) | **Done** (section 9) |
| 10 | Use the data you already have: GPA from saved marks, a progress dashboard, "what can I take next" | Proposed |

## 3. Critical bugs and security issues found

| Severity | Issue | Where | Fixed |
|---|---|---|---|
| Critical | `"/**"` permitAll made every endpoint public; anonymous course deletion and faculty-email edits | `SecurityConfig` | ✅ |
| Critical | DB password committed | `application.properties` | ✅ removed — rotate it |
| High | `/api/users/{id}` exposed any user's email | `UserController` | ✅ `PublicUserResponse` |
| High | Login revealed which emails are registered | `AuthService.login` | ✅ |
| High | Expired or garbage token → 500 on every request, including public ones | `JwtAuthenticationFilter` | ✅ |
| High | Logout never revoked the refresh token (client never called it; endpoint read the header manually) | `Header.tsx`, `AuthController` | ✅ |
| High | Users logged out on reload whenever the 15-minute access token had expired | `scheduleToken.ts` | ✅ refreshes instead |
| Medium | Stale tokens hard-coded per hook; no retry on 401 | 15 hooks | ✅ central `apiClient.ts` |
| Medium | Comment edits not validated (`@Valid` on the wrong parameter) | `CommentController` | ✅ |
| Medium | Ownership failures returned 400/500 instead of 403 | Comment/Resource services | ✅ `AccessDeniedException` → 403 |
| Medium | Unbounded page size and unchecked `sortBy` on faculty emails | `DrEmailService` | ✅ |
| Medium | Marks accepted any string | `MarkRequest` | ✅ grade pattern |
| Medium | Editing a material silently ignored its name | `ResourceMapper.updateEntity` | ✅ |
| Medium | Role check `hasRole()` compared against `ROLE_X` but the token holds `X` | `useAuth.ts` | ✅ |
| Low | `navigate()` called during render on the sign-up page | `SignUp.tsx` | ✅ `<Navigate>` |
| Low | Drawer created a second copy of all map state and queries just to close itself | `DrawerComp.tsx` | ✅ |
| Low | Comment double-submit possible; failures silent | `useCommentForm.ts` | ✅ |
| Open | No rate limiting on `/signin` and `/signup` (brute force, spam accounts) | server | ❌ see roadmap |
| Open | Access and refresh tokens in `localStorage` (readable by any XSS) | client | ❌ decision needed |
| Open | Refresh tokens are not rotated on use | `AuthService.refreshToken` | ❌ |
| Fixed | `spring.jpa.hibernate.ddl-auto=update` in production; role seeding commented out | config | ✅ Flyway + `validate` (section 9) |
| Open | JJWT 0.11 deprecated API (compile warnings) | `JwtUtil` | ❌ upgrade to 0.12 |
| Open | `lottie-web` uses `eval`, which blocks a strict Content-Security-Policy | dependency | ❌ |

## 4. UI/UX recommendations

**Done in this pass:** shared `AuthCard` layout for sign-in and sign-up (linked labels, `autocomplete`, inline errors with `role="alert"`, pending state, links between the two pages); comment cards with avatar initial, readable date, "edited" marker and `dir="auto"` for Arabic and English; a real sign-in call to action in the drawer; accessible tabs (`role="tablist"`, selected state); course names in the drawer header; active-page highlighting in the nav, with a brand link home; home cards with captions in both languages, the same frame for both cards, focus rings and reduced-motion support; a lightweight CSS loading state; a 404 page with a way back; meta description and theme color.

**Recommended next:**

1. **One design system.** Three UI kits are installed (Flowbite, HeroUI, NextUI), and only Flowbite is used. Pick Flowbite, remove the others, and define tokens (colors, radius, spacing) once in `index.css` with `@theme`.
2. **Language and direction.** The interface mixes English chrome with Arabic content. Choose a primary language (probably Arabic with `dir="rtl"` on `<html>`) and add an English toggle; right now the materials section is Arabic while every button is English.
3. **Map usability.** Add a legend (colors = departments, dotted = co-requisite), a progress bar (`12 / 72 courses · 45 credit hours`), course search, and zoom controls (`<Controls />`, `<MiniMap />` from `@xyflow/react`). On phones, open a bottom sheet instead of a full-width drawer.
4. **Empty, loading and error states.** `CommentSection` still renders plain `Loading...` / `Error: …` text; use skeletons and a retry button. Materials need an "add the first material" empty state.
5. **GPA calculator.** Use controlled inputs (it currently uses refs plus a forced re-render), show the result inline instead of only in a toast, and pre-fill from the user's saved marks.
6. **Avatars.** Every user currently shows the site's logo as their avatar; use initials.

## 5. New feature suggestions

- **Auto GPA from tracked marks.** You already store per-course grades and credit hours, so compute the cumulative GPA automatically. This is the highest-value, lowest-effort feature.
- **"What can I take next?"** The prerequisite edges are already in the map, so highlight courses whose prerequisites are all completed.
- **Progress dashboard.** Credit hours done and remaining, completion by category, and expected graduation semester.
- **Semester planner.** Drag courses into upcoming semesters, with prerequisite and credit-hour warnings.
- **Material quality.** Upvotes, a "broken link" report, and admin moderation (the role already exists, but there's no admin UI).
- **Comment replies and notifications.** Thread replies and notify the author.
- **PWA / offline.** The study plans are static; cache them so the map opens without a connection.
- **Account basics.** Password reset by email and email verification.

## 6. Prioritized roadmap

**Critical (this week)**
- Rotate the DB password that was committed, and confirm `JWT_SECRET` is a long random base64 value in Render.
- Deploy this branch (security fixes).
- ~~Make sure the `roles` table has `USER` and `ADMIN` in production~~ — done by the `V3__seed_roles` migration (section 9).

**High**
- Rate-limit `/api/auth/signin` and `/api/auth/signup` (Bucket4j or a simple in-memory limiter).
- Refresh token in an httpOnly, Secure, SameSite cookie; access token in memory only.
- ~~Flyway migrations instead of `ddl-auto=update`.~~ Done (section 9).
- Stop committing the built frontend in `server/src/main/resources/static/` (the Dockerfile rebuilds it); add it to `.gitignore`.
- Remove unused dependencies: `@heroui/*`, `@nextui-org/react`, `framer-motion`, `yup`, `react-content-loader`, the tsparticles packages, and the stale Tailwind v3 `tailwind.config.js`.

**Medium**
- Auto GPA, the "take next" highlighting and the progress bar.
- Rotate refresh tokens; upgrade JJWT to 0.12.
- Paginate comments and return the count in the same response.
- Client tests (Vitest + Testing Library) for auth and the map; a CI workflow that runs `mvn test`, `tsc` and `eslint`.

**Low**
- Rename typos (`feedbaks`, `useSiginUp`, `ResouceResponseDto`, `praticlesConfig*`, `MainLayOut`).
- Delete dead code once you confirm it isn't coming back: `FireParticles`, `ParticlesBackground`, `useOptimizedNodes`, `useInitialNodes`. (`StartupConfig` was removed with the Flyway change.)
- Replace Lottie with lighter animations (removes `eval`, so a strict CSP becomes possible).

## 7. What changed in this pass

### Server
- `SecurityConfig`: explicit public GET list; writes require authentication; course and faculty-email management require `ADMIN`; unauthenticated requests get 401 (not 403); CORS origins configurable through `app.cors.allowed-origins`; allowed headers narrowed.
- `JwtAuthenticationFilter`: invalid or expired tokens leave the request unauthenticated instead of throwing.
- `AuthController` / `AuthService`: one "Invalid email or password." message; JSON errors; `logout` uses the authenticated principal; no `printStackTrace`.
- New `GlobalExceptionHandler`: one error shape and correct status codes; no stack traces sent to clients (`server.error.include-*=never`).
- `UserController` returns `PublicUserResponse(id, username)` with no email.
- `CommentResponseDTO` now includes `username`, which removes one request per comment.
- Validation: grade pattern on marks, `@NotBlank` refresh token, comment-edit body validated, clamped paging and whitelisted sort fields.
- `ResourceMapper.updateEntity` updates the name; ownership checks throw `AccessDeniedException` (403).
- `WebConfig`: `/assets/**` cached for a year (immutable, hashed files); `index.html` stays no-cache so deploys appear immediately. Gzip compression enabled.
- Committed password removed from `application.properties`.
- Tests: `SecurityRulesTest` (8 cases: public reads, broken token, anonymous writes, user vs admin, email not exposed, grade validation, blank edit) and `ServerApplicationTests` booting the full app on in-memory H2. `mvn test`: **9/9 pass**.

### Client
- New `service/apiClient.ts`: base URL from `VITE_API_URL`, token attached automatically, single-flight refresh and retry on 401, sign-out if the refresh fails. Removed 14 hand-written `Authorization` headers.
- `scheduleToken`: refreshes an expired session instead of logging out; shares the single-flight refresh.
- `thunkAuthLogout` and the header now revoke the session on the server.
- `AxiosErrorHandler` reads `{message}` bodies (previously error objects never reached the UI).
- `useAuth.hasRole` fixed.
- Lazy Lottie (`LottieHandler`), a CSS `PageLoader` fallback, and particles removed from the common index: **entry JS 1,038 KB → 454 KB (262 → 145 KB gzip)**.
- React Query defaults (`staleTime` 60 s, no refetch on window focus, `retry: 1`); `*` route for 404.
- UI changes as listed in section 4.

### Verified
- `tsc -b` clean; `eslint` 0 errors (6 warnings were already there); `vite build` passes.
- End to end against a local Postgres 16 container: sign-up, duplicate and invalid sign-up, wrong-password and unknown-email sign-in, comment create/list with username, public user without email, anonymous and user course delete (401/403), anonymous faculty-email write (401), invalid and valid grade, broken token on public and protected routes, clamped paging, refresh, logout then refresh (rejected), SPA fallback, cache headers.
- In the browser: map, drawer (signed-out and signed-in), sign-in, posting a comment, reload with an expired access token (one refresh call, still signed in), sign-out (server call), 404, and 375 px width with no horizontal scroll.

### Not verified
- Against your production database and Render environment.
- Admin flows in the UI (there's no admin UI).
- Materials create and delete in the browser (covered by the API rules, not clicked through).

### Running it locally
`.claude/launch.json` defines `api-local` (Spring on port 8090 against Postgres on port 55432) and `web-local` (Vite on port 5173 with `VITE_API_URL=http://localhost:8090`). The throwaway database:

```bash
docker run -d --name engmap-test-db -e POSTGRES_PASSWORD=localtestpw -e POSTGRES_DB=engineeringmap -p 55432:5432 postgres:16-alpine
```

Remove it with `docker rm -f engmap-test-db`.

## 8. Second pass: new features (2026-11-04)

Built from the feature suggestions in section 5.

| Feature | Where | Notes |
|---|---|---|
| **What can I take next** | Map | Green outline + dot = all prerequisites done; dimmed = locked, hover shows what's missing. Dashed edges are co-requisites ("take together"). A course drawn twice in the map means its copy's parent is an extra requirement for what hangs below it (see `features/progress/prerequisites.ts`). |
| **Progress panel + automatic GPA** | Map | Completed courses and credit hours, GPA weighted by credit hours from saved grades, clickable list of courses you can take now. Collapses on phones. |
| **Course search** | Map | Arabic-aware (ignores أ/إ/ا, ة/ه, ى/ي, diacritics); keyboard friendly. |
| **Course requirements + ratings** | Course drawer | Prerequisites marked done/missing; community difficulty and workload ratings (1–5). |
| **What-if GPA** | GPA page | "Use my saved grades" fills the current average; the semester rows become a what-if; result and change shown on the page. |
| **Semester planner** | `/planner` | Up to 12 semesters, per plan, auto-saved. Warns about prerequisites not completed or planned earlier, missing co-requisites and semesters over 18 hours. |
| **Material votes + reports** | Materials tab | Up/down votes (best first), report with a reason. |
| **Moderation** | `/admin` (ADMIN) | Open reports (dismiss / delete material) and faculty email directory management. |
| **Comment replies + notifications** | Drawer, header bell | One-level threads; the author of the original comment is notified; the bell checks every minute and opens the course. |
| **Share progress** | `/share`, `/progress/:token` | Opt-in, revocable link; shows username and completed courses only. |
| **Offline / installable** | Whole app | Service worker caches the app (study plans work offline); API calls are never cached. |

**Fixes found along the way**
- Material links accepted `javascript:` URLs (stored XSS). The API now requires http(s); the client also refuses to render other schemes.
- A network error or server cold start while refreshing the token signed the user out. Now only a rejected refresh token signs out; network errors retry.
- Refreshing or sharing a deep link such as `/progress/…` or `/course/23` returned a server 404; the SPA fallback now covers nested paths.
- The map was taller than the screen, hiding its bottom controls on phones.

**Database:** six new tables (`resource_votes`, `resource_reports`, `course_ratings`, `notifications`, `planned_courses`, `share_links`) and one nullable column (`comments.parent_id`). With the current `ddl-auto=update` they are created automatically on deploy; verified against PostgreSQL 16.

**Tests:** server 12 (security rules, full HTTP flows for replies/notifications, votes/reports/admin, ratings/planner/sharing, and XSS link rejection); client 22 (prerequisites on both real plans, GPA, search, planner, session handling). `npm test` runs the client tests.

**Arabic / English interface**
- Arabic is the default (right-to-left); a header button switches to English, and the choice is remembered per browser. Layout mirrors in RTL (drawer, panels, arrows, map controls).
- All interface text lives in `client/src/i18n/strings.ts`, typed so a missing translation fails the type check; a test also checks both languages use the same placeholders. Known API messages are translated in `client/src/i18n/serverMessages.ts`.
- Course names, user content and faculty-email data aren't translated. Flowbite's hidden "Open main menu" label on the mobile menu button stays English (it isn't configurable).

**Decided not to build now:** password reset by email (needs an email service; skipped for now).

## 9. Flyway migrations (2026-11-04)

Hibernate no longer changes the database. Flyway owns the schema and Hibernate runs with `ddl-auto=validate`, so the app refuses to start if an entity and the database disagree (instead of silently adding columns, or leaving them out of date).

| Script | What it does |
|---|---|
| `V1__baseline_schema.sql` | The nine tables that existed before PR #2, with the constraint names Hibernate had generated. |
| `V2__progress_and_community.sql` | PR #2: six tables and `comments.parent_id`. Uses `IF NOT EXISTS`, so it is a no-op where `ddl-auto` already created them. |
| `V3__seed_roles.sql` | Adds `USER` and `ADMIN` if missing (next free id; existing rows untouched). Sign-up works on a fresh database. |

Scripts live in `server/src/main/resources/db/migration`.

**Existing databases (production).** There is no `flyway_schema_history` table yet, so on the first start `baseline-on-migrate` marks the database as version 1 and only V2 and V3 run. This works whether or not PR #2 was already deployed there. After that, every start applies only new scripts.

**Changing the schema from now on.** Edit the entity, then add the next script (`V4__short_description.sql`). Never edit a script that has already run anywhere; Flyway checks their checksums and stops the app if one changed. Keep scripts portable (PostgreSQL and H2 in PostgreSQL mode) because the tests run them on H2.

**Render.** If the service has `SPRING_JPA_HIBERNATE_DDL_AUTO` set (for example to `update`), delete it: environment variables override `application.properties`. `docker-compose.yml` no longer sets it.

**Tests.** The `local` H2 profile now builds its schema with the same scripts; the demo data moved to a test-only repeatable migration (`src/test/resources/db/local/R__local_demo_data.sql`). `MigrationsTest` checks that all scripts ran and both roles exist; every `@SpringBootTest` also validates the entities against the migrated schema. Server tests: 14.

**Verified on PostgreSQL 16** (local Docker):
- Empty database: V1–V3 run; the result is identical to the schema `ddl-auto` produced (same tables, columns, constraint and index names); roles `USER` = 1, `ADMIN` = 2.
- Database as it was before PR #2, with only a hand-inserted `USER` role (identity sequence behind): baselined at 1; V2 created the six tables and the column; V3 added `ADMIN` as id 2 without an id clash; existing users kept.
- The existing local database (created by `ddl-auto`, PR #2 included): baselined; V2 and V3 changed nothing; sign-up and sign-in work.

**Not done:** course rows are still not seeded. A new database has the roles but an empty `courses` table, so the map has no course details until they are inserted.
