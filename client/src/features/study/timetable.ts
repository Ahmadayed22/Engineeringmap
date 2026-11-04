/**
 * Weekly timetable logic, kept free of React so it can be tested on its own.
 * Days: 0 = Sunday ... 6 = Saturday. Times: minutes after midnight.
 */

export type TimetableEntry = {
  courseId?: number | null;
  title: string;
  day: number;
  start: number;
  end: number;
  location?: string | null;
  color: number;
};

/** The usual university week here is Sunday to Thursday. */
export const WORK_WEEK = [0, 1, 2, 3, 4];
export const MAX_ENTRIES = 80;

/** "08:30" → 510; null when it isn't a valid HH:MM time. */
export function parseTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 510 → "08:30" (24-hour, for inputs and calendar files). */
export const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const overlaps = (a: TimetableEntry, b: TimetableEntry) =>
  a.day === b.day && a.start < b.end && b.start < a.end;

/** Pairs of entry indexes that clash (same day, overlapping times). */
export function findClashes(entries: TimetableEntry[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (overlaps(entries[i], entries[j])) pairs.push([i, j]);
    }
  }
  return pairs;
}

/** Days to draw: Sunday–Thursday, plus Friday/Saturday only when something is on them. */
export function visibleDays(entries: TimetableEntry[]): number[] {
  const days = new Set(WORK_WEEK);
  entries.forEach((e) => days.add(e.day));
  // Saturday first when used: some faculties start the week on Saturday.
  const order = [6, 0, 1, 2, 3, 4, 5];
  return order.filter((d) => days.has(d));
}

/** First and last hour lines to draw: 8:00–17:00 at least, widened to fit every class. */
export function hourRange(entries: TimetableEntry[]): [number, number] {
  let from = 8;
  let to = 17;
  for (const e of entries) {
    from = Math.min(from, Math.floor(e.start / 60));
    to = Math.max(to, Math.ceil(e.end / 60));
  }
  return [from, Math.min(24, to)];
}

export type Placed = {
  index: number;
  /** Column inside the day (0-based) when classes overlap. */
  lane: number;
  /** How many columns the overlapping group needs. */
  lanes: number;
};

/**
 * Side-by-side layout for one day's classes: overlapping classes get separate lanes, and each
 * group of overlapping classes shares the same lane count so the blocks line up.
 */
export function layoutDay(entries: TimetableEntry[], day: number): Placed[] {
  const items = entries
    .map((e, index) => ({ e, index }))
    .filter(({ e }) => e.day === day)
    .sort((a, b) => a.e.start - b.e.start || a.e.end - b.e.end);

  const placed: Placed[] = [];
  let group: Placed[] = [];
  let groupEnd = -1;
  let laneEnds: number[] = [];

  const closeGroup = () => {
    const lanes = Math.max(1, laneEnds.length);
    group.forEach((p) => (p.lanes = lanes));
    placed.push(...group);
    group = [];
    laneEnds = [];
  };

  for (const { e, index } of items) {
    if (e.start >= groupEnd && group.length) closeGroup();
    let lane = laneEnds.findIndex((end) => end <= e.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(e.end);
    } else {
      laneEnds[lane] = e.end;
    }
    group.push({ index, lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, e.end);
  }
  if (group.length) closeGroup();
  return placed;
}

/** Total class time per week, in minutes. */
export const weeklyMinutes = (entries: TimetableEntry[]) =>
  entries.reduce((sum, e) => sum + (e.end - e.start), 0);

const icsText = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/([,;])/g, '\\$1');

const icsDate = (d: Date, minutes: number) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}` +
  `T${formatTime(minutes).replace(':', '')}00`;

/**
 * A calendar file (.ics) with every class repeating weekly for {@code weeks} weeks, starting
 * from the first matching day on or after {@code from}. Times are "floating" (no time zone), so
 * calendar apps keep them at the same local time.
 */
export function toIcs(
  entries: TimetableEntry[],
  from: Date,
  weeks = 16
): string {
  const stamp = `${icsDate(from, from.getHours() * 60 + from.getMinutes())}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Engineering Map//Timetable//EN',
    'CALSCALE:GREGORIAN',
  ];
  entries.forEach((e, i) => {
    const first = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    first.setDate(first.getDate() + ((e.day - first.getDay() + 7) % 7));
    lines.push(
      'BEGIN:VEVENT',
      `UID:${stamp}-${i}@engmaps.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(first, e.start)}`,
      `DTEND:${icsDate(first, e.end)}`,
      `RRULE:FREQ=WEEKLY;COUNT=${weeks}`,
      `SUMMARY:${icsText(e.title)}`
    );
    if (e.location) lines.push(`LOCATION:${icsText(e.location)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
