// Load test for the Engineering Map API. No dependencies (Node 18+ fetch).
//
//   node tools/loadtest/loadtest.mjs [phase] [--base=http://localhost:8090] [--users=300]
//
// Phases: reads | signup | signin | students | uploads | all (default).
// Test users are called lt_<n> (email lt_<n>@loadtest.local, password below), so they
// can be removed afterwards with tools/loadtest/cleanup.sql.
// Only point this at a local or staging server you own.

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('='))
);
const phase = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'all';
const BASE = args.base ?? 'http://localhost:8090';
const USERS = Number(args.users ?? 300);
const PASSWORD = 'LoadTest!2026';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- tiny runner ----------
function stats(name, samples, seconds) {
  const lat = samples.map((s) => s.ms).sort((a, b) => a - b);
  const pick = (p) => (lat.length ? lat[Math.min(lat.length - 1, Math.floor((p / 100) * lat.length))] : 0);
  const codes = {};
  samples.forEach((s) => (codes[s.status] = (codes[s.status] ?? 0) + 1));
  const failed = samples.filter((s) => !(s.status >= 200 && s.status < 400)).length;
  return {
    name,
    requests: samples.length,
    rps: Math.round(samples.length / seconds),
    p50: Math.round(pick(50)),
    p95: Math.round(pick(95)),
    p99: Math.round(pick(99)),
    max: Math.round(lat[lat.length - 1] ?? 0),
    errorPct: samples.length ? +((failed / samples.length) * 100).toFixed(2) : 0,
    codes,
  };
}

async function timed(samples, label, fn) {
  const t = performance.now();
  let status = 0;
  try {
    const res = await fn();
    status = res.status;
    await res.arrayBuffer(); // read the body like a browser would
  } catch (e) {
    status = e.cause?.code ?? 'ERR';
  }
  samples.push({ label, status, ms: performance.now() - t });
  return status;
}

/** Runs `workers` loops of `step(i, samples)` for `seconds`. */
async function load(name, workers, seconds, step) {
  const samples = [];
  const end = Date.now() + seconds * 1000;
  const started = performance.now();
  await Promise.all(
    Array.from({ length: workers }, async (_, i) => {
      while (Date.now() < end) await step(i, samples);
    })
  );
  const r = stats(name, samples, (performance.now() - started) / 1000);
  print(r);
  if (args.breakdown) breakdown(samples);
  return r;
}

function print(r) {
  console.log(
    `${r.name.padEnd(34)} req=${String(r.requests).padStart(6)}  rps=${String(r.rps).padStart(5)}  ` +
      `p50=${r.p50}ms p95=${r.p95}ms p99=${r.p99}ms max=${r.max}ms  errors=${r.errorPct}%  ${JSON.stringify(r.codes)}`
  );
}

const json = (method, path, body, token) =>
  fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

// ---------- data the scenarios use ----------
let courseIds = [];
async function discover() {
  const res = await fetch(`${BASE}/api/courses`);
  const list = res.ok ? await res.json() : [];
  courseIds = list.map((c) => c.id).slice(0, 60);
  if (!courseIds.length) courseIds = [1, 2, 3, 4, 5];
  console.log(`API ${BASE}: ${list.length} courses, using ${courseIds.length} for reads`);
}
const anyCourse = () => courseIds[Math.floor(Math.random() * courseIds.length)];

// ---------- phases ----------
const PUBLIC_READS = [
  () => '/api/plans',
  () => '/api/maps/cpe',
  () => '/api/courses',
  () => `/api/comments/course/${anyCourse()}`,
  () => `/api/resource/course/${anyCourse()}`,
  () => `/api/past-exams/course/${anyCourse()}`,
  () => `/api/courses/${anyCourse()}/ratings`,
];

async function reads() {
  console.log('\n== Anonymous visitors opening maps and course drawers (no pauses) ==');
  const out = [];
  for (const c of [25, 100, 250, 500]) {
    out.push(
      await load(`reads, ${c} at once`, c, 15, (i, s) => {
        const path = PUBLIC_READS[Math.floor(Math.random() * PUBLIC_READS.length)]();
        return timed(s, path, () => fetch(BASE + path));
      })
    );
  }
  return out;
}

async function signup() {
  console.log(`\n== Creating ${USERS} student accounts (20 at a time) ==`);
  const samples = [];
  const started = performance.now();
  let next = 0;
  await Promise.all(
    Array.from({ length: 20 }, async () => {
      while (next < USERS) {
        const n = next++;
        await timed(samples, 'signup', () =>
          json('POST', '/api/auth/signup', {
            username: `lt_${n}`,
            email: `lt_${n}@loadtest.local`,
            password: PASSWORD,
          })
        );
      }
    })
  );
  const r = stats('sign-up', samples, (performance.now() - started) / 1000);
  print(r);
  if (r.codes['409'] || r.codes['400']) console.log('  (409/400 = account already exists from an earlier run; fine)');
  return r;
}

const tokens = [];
async function signin(burst = USERS) {
  console.log(`\n== ${burst} students signing in at the same moment ==`);
  const samples = [];
  const started = performance.now();
  await Promise.all(
    Array.from({ length: burst }, async (_, n) => {
      const t = performance.now();
      let status = 'ERR';
      try {
        const res = await json('POST', '/api/auth/signin', { email: `lt_${n}@loadtest.local`, password: PASSWORD });
        status = res.status;
        if (res.ok) tokens[n] = (await res.json()).accessToken;
        else await res.arrayBuffer();
      } catch (e) {
        status = e.cause?.code ?? 'ERR';
      }
      samples.push({ label: 'signin', status, ms: performance.now() - t });
    })
  );
  const r = stats('sign-in burst', samples, (performance.now() - started) / 1000);
  print(r);
  return r;
}

const ACTION_NAMES = ['GET completed', 'GET unread-count', 'GET timetable', 'PUT timetable', 'GET exam-dates',
  'GET planner', 'GET resources', 'GET past-exams', 'GET comments'];

/** Latency per request type, slowest first. */
function breakdown(samples) {
  const by = {};
  samples.forEach((x) => (by[x.label] ??= []).push(x));
  Object.entries(by)
    .map(([label, xs]) => stats('  ' + label, xs, 1))
    .sort((a, b) => b.p95 - a.p95)
    .forEach((r) => console.log(`${r.name.padEnd(22)} n=${String(r.requests).padStart(5)} p50=${r.p50}ms p95=${r.p95}ms errors=${r.errorPct}%`));
}

/** One "click" of a signed-in student: what the map, timetable, exams and planner pages call. */
function studentStep(i, s) {
  const token = tokens[i % tokens.length];
  const c = anyCourse();
  const actions = [
    () => json('GET', '/api/courses/user/completed', undefined, token),
    () => json('GET', '/api/notifications/unread-count', undefined, token),
    () => json('GET', '/api/timetable', undefined, token),
    () =>
      json('PUT', '/api/timetable', {
        items: [
          { courseId: c, title: 'Load test class', day: i % 5, start: 480, end: 570, location: 'E1', color: i % 8 },
          { title: 'Lab', day: (i + 2) % 5, start: 600, end: 720, color: 1 },
        ],
      }, token),
    () => json('GET', '/api/exam-dates', undefined, token),
    () => json('GET', '/api/planner?plan=cpe', undefined, token),
    () => json('GET', `/api/resource/course/${c}`, undefined, token),
    () => json('GET', `/api/past-exams/course/${c}`, undefined, token),
    () => json('GET', `/api/comments/course/${c}`, undefined, token),
  ];
  const k = Math.floor(Math.random() * actions.length);
  return timed(s, ACTION_NAMES[k], actions[k]);
}

async function students() {
  if (!tokens.filter(Boolean).length) await signin();
  const live = tokens.filter(Boolean);
  tokens.length = 0;
  tokens.push(...live);
  const n = tokens.length;
  console.log(`\n== ${n} signed-in students using the app ==`);
  const out = [];
  // Realistic: each student clicks something every 1–3 s.
  out.push(
    await load(`${n} students, 1–3 s between clicks`, n, 30, async (i, s) => {
      await studentStep(i, s);
      await sleep(1000 + Math.random() * 2000);
    })
  );
  // Stress: same students, no pauses at all.
  out.push(await load(`${n} students, no pauses (stress)`, n, 20, studentStep));
  return out;
}

async function uploads() {
  if (!tokens.filter(Boolean).length) await signin(20);
  const live = tokens.filter(Boolean).slice(0, 20);
  console.log(`\n== ${live.length} students uploading a 2 MB past exam at once ==`);
  const pdf = new Uint8Array(2 * 1024 * 1024).fill(32);
  pdf.set(new TextEncoder().encode('%PDF-1.4\n'));
  const samples = [];
  const ids = [];
  const started = performance.now();
  await Promise.all(
    live.map(async (token) => {
      const form = new FormData();
      form.append('file', new Blob([pdf], { type: 'application/pdf' }), 'loadtest.pdf');
      form.append('kind', 'FINAL');
      form.append('year', '2025');
      form.append('term', 'FIRST');
      const t = performance.now();
      let status = 'ERR';
      try {
        const res = await fetch(`${BASE}/api/past-exams/course/${courseIds[0]}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        status = res.status;
        if (res.ok) ids.push([(await res.json()).id, token]);
        else await res.arrayBuffer();
      } catch (e) {
        status = e.cause?.code ?? 'ERR';
      }
      samples.push({ label: 'upload', status, ms: performance.now() - t });
    })
  );
  print(stats('2 MB uploads', samples, (performance.now() - started) / 1000));
  // Remove them again (each student deletes their own).
  await Promise.all(ids.map(([id, token]) => json('DELETE', `/api/past-exams/${id}`, undefined, token)));
  console.log(`  removed ${ids.length} test uploads`);
}

/** Each public endpoint alone, 50 at once, to see which one is the bottleneck. */
async function endpoints() {
  console.log('\n== Each public endpoint alone, 50 at once for 6 s ==');
  for (const make of PUBLIC_READS) {
    const label = make().replace(/\/\d+(\/|$)/, '/{id}$1');
    await load(label, 50, 6, (i, s) => {
      const path = make();
      return timed(s, path, () => fetch(BASE + path));
    });
  }
}

await discover();
if (phase === 'endpoints') await endpoints();
if (phase === 'reads' || phase === 'all') await reads();
if (phase === 'signup' || phase === 'all') await signup();
if (phase === 'signin' || phase === 'all') await signin();
if (phase === 'students' || phase === 'all') await students();
if (phase === 'uploads' || phase === 'all') await uploads();
