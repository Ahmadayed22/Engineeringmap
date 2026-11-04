import { describe, expect, it } from 'vitest';
import {
  findClashes,
  formatTime,
  hourRange,
  layoutDay,
  parseTime,
  toIcs,
  visibleDays,
  weeklyMinutes,
  type TimetableEntry,
} from './timetable';
import { formatSize, splitExams, timeLeft } from './exams';

const cls = (
  day: number,
  start: string,
  end: string,
  title = 'Class'
): TimetableEntry => ({
  title,
  day,
  start: parseTime(start)!,
  end: parseTime(end)!,
  color: 0,
});

describe('timetable', () => {
  it('parses and formats times', () => {
    expect(parseTime('08:30')).toBe(510);
    expect(parseTime('8:05')).toBe(485);
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('9am')).toBeNull();
    expect(formatTime(510)).toBe('08:30');
  });

  it('finds clashes only on the same day', () => {
    const week = [
      cls(0, '08:00', '09:30'),
      cls(0, '09:00', '10:00'), // overlaps the first
      cls(0, '09:30', '11:00'), // touches the first: no clash, overlaps the second
      cls(1, '08:00', '09:30'), // other day
    ];
    expect(findClashes(week)).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });

  it('draws Sunday–Thursday plus weekend days that are used', () => {
    expect(visibleDays([])).toEqual([0, 1, 2, 3, 4]);
    expect(visibleDays([cls(6, '10:00', '11:00')])).toEqual([6, 0, 1, 2, 3, 4]);
  });

  it('widens the hour range to fit every class', () => {
    expect(hourRange([])).toEqual([8, 17]);
    expect(
      hourRange([cls(0, '07:30', '08:30'), cls(1, '17:00', '18:15')])
    ).toEqual([7, 19]);
  });

  it('puts overlapping classes side by side', () => {
    const day = [
      cls(2, '08:00', '10:00'),
      cls(2, '09:00', '11:00'),
      cls(2, '10:00', '11:00'),
      cls(2, '12:00', '13:00'),
    ];
    const placed = layoutDay(day, 2);
    const byIndex = Object.fromEntries(placed.map((p) => [p.index, p]));
    expect(byIndex[0]).toEqual({ index: 0, lane: 0, lanes: 2 });
    expect(byIndex[1]).toEqual({ index: 1, lane: 1, lanes: 2 });
    // Reuses the first lane once the 8–10 class has ended.
    expect(byIndex[2]).toEqual({ index: 2, lane: 0, lanes: 2 });
    expect(byIndex[3]).toEqual({ index: 3, lane: 0, lanes: 1 });
    expect(layoutDay(day, 3)).toEqual([]);
  });

  it('adds up weekly class time', () => {
    expect(
      weeklyMinutes([cls(0, '08:00', '09:30'), cls(2, '08:00', '09:00')])
    ).toBe(150);
  });

  it('writes a weekly-repeating calendar file', () => {
    // Wednesday 5 Nov 2025; a Sunday class starts on the following Sunday (9 Nov).
    const ics = toIcs(
      [{ ...cls(0, '08:00', '09:30', 'Circuits, Sec 1'), location: 'E201' }],
      new Date(2025, 10, 5, 12, 0),
      16
    );
    expect(ics).toContain('DTSTART:20251109T080000');
    expect(ics).toContain('DTEND:20251109T093000');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;COUNT=16');
    expect(ics).toContain('SUMMARY:Circuits\\, Sec 1');
    expect(ics).toContain('LOCATION:E201');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
  });
});

describe('exam countdown', () => {
  const now = new Date('2025-11-05T10:00:00Z');

  it('counts days, hours and minutes left', () => {
    expect(timeLeft('2025-11-07T13:30:00Z', now)).toEqual({
      past: false,
      days: 2,
      hours: 3,
      minutes: 30,
    });
    expect(timeLeft('2025-11-05T09:00:00Z', now).past).toBe(true);
  });

  it('splits upcoming from past exams', () => {
    const exams = [
      { id: 1, startsAt: '2025-11-20T08:00:00Z' },
      { id: 2, startsAt: '2025-11-01T08:00:00Z' },
      { id: 3, startsAt: '2025-11-06T08:00:00Z' },
      { id: 4, startsAt: '2025-10-01T08:00:00Z' },
    ];
    const { upcoming, past } = splitExams(exams, now);
    expect(upcoming.map((e) => e.id)).toEqual([3, 1]);
    expect(past.map((e) => e.id)).toEqual([2, 4]);
  });

  it('formats file sizes', () => {
    expect(formatSize(20480)).toBe('20 KB');
    expect(formatSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});
