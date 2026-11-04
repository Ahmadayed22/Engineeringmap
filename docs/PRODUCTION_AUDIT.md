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

## 10. Editable study maps (2026-11-04)

The CPE and EE maps used to be ~3,000 lines of hard-coded TypeScript. They now live in the database and admins edit them in the app.

**Decisions (agreed before building):** one map document per plan with version history; a visual editor on the map; removing a course only takes its box off the map (the course, its comments, materials, grades and ratings stay); the two plans are edited in place (no parallel plan versions).

**Database.** `V4__study_maps.sql` creates `study_maps` (plan, version, JSON content, author, time) and seeds version 1 of both plans from the old client files: same boxes, positions, colours and arrows. One arrow in the CPE file pointed to a box that doesn't exist (`math2-to-signalsSystems`); it was never drawn or used, and it isn't in the seed. Every publish adds a version; the map shown is the newest.

**API** (`StudyMapController`, `StudyMapService`)
| Endpoint | Who | What |
|---|---|---|
| `GET /api/maps/{cpe\|ee}` | anyone | current map |
| `PUT /api/admin/maps/{plan}` | ADMIN | publish `{baseVersion, content}`; 409 if someone published since `baseVersion` |
| `GET /api/admin/maps/{plan}/versions` | ADMIN | history (version, time, author) |
| `POST /api/admin/maps/{plan}/versions/{v}/restore` | ADMIN | publish an old version again as the newest |

Published maps are checked on the server: exactly one title banner, unique box and arrow ids, every box points to an existing course, arrows join existing boxes, nothing points at the banner, no duplicate arrows, no prerequisite loops, `#rrggbb` colours. Only plain fields are stored (no styles), so a map can't carry markup.

**Client**
- Maps load from the API (`features/map/useStudyMap.ts`) and are cached in `localStorage`, so repeat visits are instant and the map still works offline. The map page, planner, shared-progress page and `/course/:id` all use the loaded maps.
- Admins see **Edit map** on the map. The editor (`features/map/editor/`, loaded only when opened) lets them drag boxes, draw prerequisite arrows from the dot under a course, mark an arrow as co-requisite (dashed), change colours (per-plan presets or any colour), rename a course on the map, set credit hours, add a new or existing course, remove boxes and arrows, undo (Ctrl+Z), see the history and restore a version.
- Changes are a draft kept in the browser until **Publish**; students see nothing before that. A draft made on an older version is discarded when the editor opens.
- Two exceptions are saved immediately because they are course data, not map layout: creating a new course and changing credit hours.
- New text is in `i18n/strings.ts` (Arabic and English); the server's map errors are translated in `i18n/serverMessages.ts`.

**Fixes found while testing**
- *Adding a course failed with a duplicate-key error.* The `courses` rows were inserted with explicit ids, so PostgreSQL's id sequence never moved (it was at 1 locally; production will be the same, since its ids match the old map files). New Flyway callback `db/vendor/postgresql/afterMigrate__sync_id_sequences.sql` runs after every migrate and moves each identity sequence past the highest id (never backwards). Configured through `spring.flyway.locations=classpath:db/migration,classpath:db/vendor/{vendor}`.
- *Course endpoints leaked SQL errors.* `CourseController` returned any exception's message, so that failure showed the SQL statement to the user. The controller no longer catches exceptions; `CourseService` throws `IllegalArgumentException` (duplicate name, 400) or `ResourceNotFoundException` (404), and anything else becomes the generic 500 message.
- One arrow in the CPE data pointed to a missing box (see above).

**Tests.** Server 19 (`StudyMapTest`: public read, 401/403 for non-admins, publish, conflict, history, restore, every validation rule, the seeded maps passing all rules, and course errors without internal details). Client 33 (the converter round-trips both seeded maps exactly; editor rules for arrows, ids and renaming; translated errors). The "real study plans" tests now run on the seeded maps.

**Verified in the browser** (local PostgreSQL 16, Arabic and English): V4 ran on the existing database; the map, progress panel, planner and `/course/:id` load from the API; a student sees no **Edit map** button; as admin: created a course (id 201), dragged it, drew a prerequisite arrow, the editor refused an arrow that would make a loop, the draft survived a page reload, published version 2 (students' map, search and course drawer showed the new course), then restored version 1 from History (the course row stayed). Phone width: no horizontal scroll.

**Notes for admins**
- Drawing an arrow *from a copy* of a course (a course shown twice) also makes the copy's parent a requirement, as on the 2022 maps. Draw from the course's main box for a plain prerequisite.
- Credit hours and new courses are saved immediately (they are course data); everything else waits for **Publish**.
- `Home` still shows the two plan pictures (`assets/EngPlan/*.webp`); they don't change when a map is edited.

## 11. New roadmaps (2026-11-04)

Admins can create roadmaps besides CPE and EE: a new major, or a new version of an existing plan.

**Decisions (agreed before building):** any kind of roadmap (one general feature); the admin starts from a copy of an existing roadmap or from an empty map; a new roadmap stays hidden from students until an admin shows it, and hiding never deletes anything.

**Database.** `V5__study_plans.sql` adds `study_plans` (slug, Arabic and English name, visible, order) seeded with `cpe` and `ee`; widens `study_maps.plan` and `planned_courses.plan` to 40 characters and links both to `study_plans.slug` with foreign keys. A roadmap's slug is made from its English name (`Computer Engineering 2026` → `computer-engineering-2026`, then `-2`, `-3` if taken) and never changes.

**API**
| Endpoint | Who | What |
|---|---|---|
| `GET /api/plans` | anyone | visible roadmaps in order; admins also get hidden ones |
| `POST /api/admin/plans` | ADMIN | `{nameAr, nameEn, copyFrom?}`: creates it hidden, with map version 1 copied from `copyFrom` (title renamed) or containing only the title |
| `PUT /api/admin/plans/{slug}` | ADMIN | rename, show/hide, reorder (any field may be left out) |

Hidden roadmaps answer 404 to students for their map and the planner. The roadmap id in URLs is no longer a fixed list (`cpe|ee`): a well-formed but unknown id is 404, a malformed one 400.

**Client**
- The home page lists roadmaps from the API. CPE and EE keep their pictures; new roadmaps get a plain card. Admins see a **New roadmap** card, a **Settings** button on every card (names, visible, order) and a "Hidden" badge.
- Creating a roadmap opens its map straight in the editor (`?edit=1`).
- New roadmaps live at `/plan/<slug>`; CPE and EE keep `/computerEngineer` and `/electricalEngineer`, so old links and notifications still work.
- The planner, shared progress page and `/course/:id` work with any number of roadmaps (the shared page only uses visible ones).
- The editor offers new roadmaps every colour preset of both original maps.
- The last roadmap list is cached in the browser (visible ones only) for offline use.
- Admin controls on a map (Edit map, "Hidden from students") sit in a bar above the map instead of floating over it, so they no longer cover the course search or the progress panel on narrow screens.

**Tests.** Server 23 (`StudyPlanTest`: listing, copy and blank creation, hidden roadmaps invisible to students for map and planner, showing, renaming and reordering, id generation and duplicates, admin-only access, bad input). Client 37 (roadmap paths, names, colour presets for new roadmaps, remembering the planner's last roadmap).

**Verified in the browser** (local PostgreSQL 16): V5 ran on the existing database; as admin, created "هندسة الحاسوب 2026" as a copy of CPE: it opened in the editor at `/plan/computer-engineering-2026` with the copied map and its own title, showed "Hidden" to the admin, and was absent (404) for visitors; made it visible from its settings: it then appeared for visitors, on the home page (plain card) and as a planner tab.

## 12. Roadmap pictures and removal (2026-11-04)

Two additions to a roadmap's **Settings** on the home page.

**Decisions (agreed before building):** removing a roadmap deletes the roadmap, its map history and students' semester-planner entries for it, and keeps courses with their comments, materials, grades and ratings; the admin types the roadmap's name to confirm and the last roadmap can't be removed. The picture is the home-page card picture, uploaded as a file and stored in the database (Render's disk is wiped on every deploy).

**Card picture**
- `V6__study_plan_images.sql` adds `study_plan_images` (one picture per roadmap, deleted with it) and `study_plans.image_version`.
- `PUT /api/admin/plans/{slug}/image` (multipart `file`, ADMIN) and `DELETE` the same path. The server decides the type from the file's first bytes and accepts only JPEG, PNG and WebP (an SVG, which could carry script, is refused); 2 MB at most.
- `GET /api/plans/{slug}/image` is public (an `<img>` sends no token) and cached for a year; the client adds `?v=<image_version>` so a new picture shows at once.
- The browser shrinks the chosen picture to at most 1600×1200 and re-encodes it as WebP before uploading (a 4.3 MB PNG became 14 KB).
- CPE and EE keep their bundled pictures until an admin uploads one; removing an uploaded picture brings the bundled one back.

**Removing a roadmap:** `DELETE /api/admin/plans/{slug}` (ADMIN). Deletes planner entries, map versions, picture and the roadmap. Refused for the last remaining roadmap. The settings dialog explains what is kept and enables **Remove permanently** only after the name is typed.

**Tests.** Server 28 (`StudyPlanImageAndRemovalTest`: upload, public cached download, SVG refused, picture removal, roadmap removal keeps the course and clears maps, planner rows and picture, admin-only; `StudyPlanServiceTest`: last roadmap can't be removed, picture types by content, ids from English names). Client 39.

**Verified in the browser** (local PostgreSQL 16, as a separate test admin): uploaded a 3000×2000 PNG to "هندسة الحاسوب 2026": stored as a 1600×1067 WebP of 14 KB, served with a one-year cache and `nosniff`, shown on its card; created a throwaway roadmap from an empty map (only the title banner), then removed it after typing its name: card gone, maps deleted, its address answers 404.

**Note.** The app keeps one session per account (`refresh_token.user_id` is unique): signing in as the same user somewhere else signs out the first browser. That is existing behaviour; it is why local browser checks use their own test admin.

## 13. Signed in on several devices (2026-11-04)

Signing in on a second device used to sign the first one out at its next token refresh: `refresh_token.user_id` was unique and every sign-in replaced the user's only refresh token. Each sign-in now gets its own refresh token.

**Database.** `V7__refresh_token_per_sign_in.sql` drops the unique constraint on `refresh_token.user_id` (`ukf95ixxe7pa48ryn1awmh2evt7`) and adds a plain index `idx_refresh_token_user_id`. The foreign key is dropped and added back with the same name around it, because H2 otherwise keeps the old unique index alive under the foreign key. Checked on PostgreSQL 16 (V1 then V7 on an empty database) and on H2 (the tests).

**Server**
- `RefreshToken.user` is `@ManyToOne` (was `@OneToOne`, unique).
- Sign-in creates a new token and leaves the user's other tokens alone. It also deletes that user's expired tokens and keeps at most 10 sign-ins per user (the oldest is dropped).
- Refresh looks the token up by its value. Unknown, revoked and expired tokens all get the same 403 `"Your session has expired. Please sign in again."` (already translated in `serverMessages.ts`); an expired token is deleted when it is used.
- `POST /api/auth/logout` takes `{refreshToken}` and revokes only that token, and only if it belongs to the signed-in user. Without a body it revokes nothing (the token expires on its own); it used to delete every token of the user.
- The daily `@Scheduled` job still deletes all expired tokens and now logs how many.
- Token lifetimes are unchanged (access 15 min, refresh 7 days; the refresh token is not rotated).

**Client.** `thunkAuthLogout` sends the device's refresh token to `/api/auth/logout` (it sent nothing before, so the server could only sign out every device).

**Tests.** Server 35 after merging section 12 (`AuthSessionsTest`: two sign-ins both refresh; logging out one leaves the other working; logout can't revoke another user's token; logout without a body revokes nothing; an expired token is rejected and deleted; an unknown token is rejected; sign-in removes expired tokens and caps sign-ins at 10). `MigrationsTest` expects V1–V7. Client 39, `tsc -b` and `eslint .` clean (0 errors).

**Not verified:** not tried in two real browsers against the local PostgreSQL stack (V7 was not applied to the shared local database); the HTTP flows above run through MockMvc on H2.

## 14. Timetable, past exam bank, exam countdown, approvals (2026-11-04)

Three student tools, plus admin approval for everything students upload. Choices made with the owner: exam files are uploaded and stored in the database; admin uploads are public at once, student uploads (past exams and material links) stay hidden until an admin approves them; exam dates are private to each student; the timetable is saved per account.

| Feature | Where | Notes |
|---|---|---|
| **Weekly timetable** | `/schedule` (signed in; header link "جدولي") | Add a class once for several days; course names suggested from the catalogue and from next semester in the planner. Clashes are listed and drawn side by side (allowed, so two section options can be compared). Auto-saved. Print view, and a `.ics` calendar file that repeats weekly for 16 weeks. Sunday–Thursday, plus Saturday/Friday only when used. |
| **Past exam bank** | Course drawer, new "امتحانات سابقة" tab | PDF, JPG, PNG or WebP up to 10 MB, with kind (first/second/midterm/final/quiz/other), semester, year, doctor and "includes the solution". Approved files open in a new tab or download; the uploader sees their own waiting uploads with a "waiting for review" badge and can delete them. |
| **Exam countdown** | `/exams` (signed in; header link "امتحاناتي") | Private exam dates with a live countdown; next exam highlighted, finished ones folded away. Reminders in the notification bell 3 days before and again within the last day (a moved exam gets them again). |
| **Approvals** | `/admin`, new "بانتظار الموافقة" section | New materials and past exams from students, with approve / reject. Reject deletes the upload. The student is notified either way. |

**Server**
- `V8__timetable_exams_and_approval.sql`: `resource.approved` (default true, so every existing material stays visible), `timetable_entries`, `past_exams` + `past_exam_files` (the bytes in their own table so lists never load them), `exam_dates`.
- `StudyToolsController`: `GET/PUT /api/timetable`; `GET/POST /api/exam-dates`, `PUT/DELETE /api/exam-dates/{id}`; `GET /api/past-exams/course/{id}` and `GET /api/past-exams/{id}/file` (public reads), `POST /api/past-exams/course/{id}` (multipart), `DELETE /api/past-exams/{id}`; `/api/admin/past-exams/pending|{id}/approve|{id}/reject` and the same for `/api/admin/materials`.
- File type is checked by content (`%PDF-` or the image signatures), not by name or browser type; the stored name is cleaned. Files are served with `Content-Security-Policy: sandbox` and `nosniff`; approved ones are cached for 30 days, waiting ones `no-store` and only for their uploader and admins (others get 404). A student can have at most 20 uploads waiting.
- Materials: students' new links start unapproved; a student who edits a link sends it back for review; votes and reports only work on approved materials; `GET /api/resource/{id}` hides waiting ones from others.
- Upload limit raised to 11 MB (`spring.servlet.multipart.*`); the too-large message is now the generic file one.
- Notifications: new types `MATERIAL_APPROVED/REJECTED`, `EXAM_APPROVED/REJECTED`, `EXAM_SOON`, `EXAM_TOMORROW`. Their `message` is only the name; the client words it in the UI language. Reminders come from a `@Scheduled` job every 15 minutes.

**Client:** `pages/schedule/Schedule.tsx` (was a placeholder), `pages/Exams/MyExams.tsx`, `features/study/` (`timetable.ts` and `exams.ts` hold the tested logic: clashes, lanes, hour range, `.ics`, countdown), drawer tab, admin review list, pending badge on materials, bell wording. 120 new strings in both languages; server messages translated.

**Tests.** Server 38 (`StudyToolsTest`: timetable per student and validation; student exam hidden until approved, served with the sandbox header, delete rules, admin upload public at once, reject notifies; exam dates private, reminders sent once each and again after the exam moves. `CommunityFlowTest` now approves the material before voting and checks it was hidden before). Client 49, `tsc -b` clean, `eslint` 0 errors.

**Verified in the browser** (local PostgreSQL 16; V7 and V8 applied to the shared local database): as a student, added a Sun/Tue/Thu class and a clashing Sunday lab (warning shown, blocks side by side, saved across reload); added two exams (countdown shown); uploaded a PDF in a course's past exams tab (waiting badge, "sent for review" toast, file fetched with the token). As the test admin: saw it in the review list and approved it (student got `EXAM_APPROVED`, file then public); a student material link stayed hidden from anonymous visitors, showed in the review list, and rejecting it removed it and notified the student. Phone width (375 px) has no horizontal scroll; English and Arabic both checked.

**Not verified:** the `.ics` file imported into a real calendar app; printing; opening a waiting file in a new tab (the browser pane doesn't show pop-ups; the request itself returned 200); the bell's wording for the new types was not clicked through in the UI (the API returns the types; the wording is a direct lookup); the reminder job firing on its own schedule (covered by calling it in the test).

**Worth knowing:** files live in PostgreSQL, so the database grows with every upload (10 MB each at most). If it gets large, move `past_exam_files` to object storage (S3/R2) later; nothing else depends on where the bytes are.
