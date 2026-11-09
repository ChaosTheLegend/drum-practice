// @ts-check
// Date helpers and mapping of program days onto user-configured dates.
// Dates are plain 'YYYY-MM-DD' strings, handled in UTC to avoid DST issues.

import { makeExtraDay } from './data/program.js';

const DAY_MS = 86400000;
const MAX_SPAN_DAYS = 366;

/** @param {string} iso */
export function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
/** @param {Date} date */
export function toIso(date) {
  return date.toISOString().slice(0, 10);
}
/** @param {string} iso @param {number} n */
export function addDays(iso, n) {
  return toIso(new Date(parseIso(iso).getTime() + n * DAY_MS));
}
/** @param {string} a @param {string} b  days from a to b */
export function diffDays(a, b) {
  return Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / DAY_MS);
}
/** @param {string} iso */
export function weekday(iso) {
  return parseIso(iso).getUTCDay();
}
export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** @param {string} iso @param {Intl.DateTimeFormatOptions} [opts] */
export function formatDate(iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  if (!iso) return '';
  return parseIso(iso).toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' });
}

/**
 * @param {import('./models.js').Settings} settings
 * @param {string} iso
 */
export function isRestDate(settings, iso) {
  return iso in settings.restDates || settings.restWeekdays.includes(weekday(iso));
}

/**
 * Map program days onto the training dates between start and end (inclusive).
 * The last program day (final assessment) always lands on the last training date.
 * @param {import('./models.js').TrainingProgram} program
 * @param {import('./models.js').Settings} settings
 * @returns {import('./models.js').Schedule}
 */
export function buildSchedule(program, settings) {
  const { startDate, endDate } = settings;
  /** @type {string[]} */
  const warnings = [];
  if (!startDate || !endDate) return { configured: false, entries: [], training: [], warnings };
  if (endDate < startDate) {
    return { configured: false, entries: [], training: [], warnings: ['The end date is before the start date.'] };
  }

  let span = diffDays(startDate, endDate) + 1;
  if (span > MAX_SPAN_DAYS) {
    warnings.push(`Range limited to ${MAX_SPAN_DAYS} days.`);
    span = MAX_SPAN_DAYS;
  }

  const dates = Array.from({ length: span }, (_, i) => addDays(startDate, i));
  const trainingDates = dates.filter((d) => !isRestDate(settings, d));
  const n = trainingDates.length;

  const finalDay = program.days[program.days.length - 1];
  const regular = program.days.slice(0, -1);
  /** @type {import('./models.js').TrainingDay[]} */
  let assigned = [];

  if (n === 0) {
    warnings.push('Every day in the range is a rest day — there are no training days.');
  } else if (n - 1 >= regular.length) {
    // Spread any surplus training days evenly through the program as review days.
    const extras = n - 1 - regular.length;
    let added = 0;
    regular.forEach((day, i) => {
      assigned.push(day);
      const due = Math.floor(((i + 1) * extras) / regular.length);
      while (added < due) assigned.push(makeExtraDay(++added));
    });
    assigned.push(finalDay);
    if (extras > 0) {
      warnings.push(`${n} training days but the program has ${program.days.length}: ${extras} review & consolidation day${extras > 1 ? 's were' : ' was'} spread through the schedule.`);
    }
  } else {
    const kept = regular.slice(0, n - 1);
    const skipped = regular.slice(n - 1);
    assigned = [...kept, finalDay];
    warnings.push(`Only ${n} training day${n > 1 ? 's' : ''} for a ${program.days.length}-day program — skipped: ${skipped.map((d) => `Day ${d.dayNumber} (${d.title})`).join(', ')}.`);
  }

  let slot = 0;
  /** @type {import('./models.js').ScheduleEntry[]} */
  const entries = dates.map((date) => {
    if (isRestDate(settings, date)) {
      return { date, isRest: true, restLabel: settings.restDates[date] || '', day: null, slot: 0 };
    }
    const day = assigned[slot] ?? null;
    slot += 1;
    return { date, isRest: false, day, slot };
  });

  return { configured: true, entries, training: entries.filter((e) => !e.isRest && e.day), warnings };
}

/**
 * @param {import('./models.js').AppState} state
 * @param {import('./models.js').TrainingDay} day
 */
export function isDayComplete(state, day) {
  const p = state.dayProgress[day.id];
  if (!p) return false;
  return p.manual || (day.items.length > 0 && day.items.every((_, i) => p.done[i]));
}

/**
 * @param {import('./models.js').AppState} state
 * @param {import('./models.js').TrainingDay} day
 */
export function hasActivity(state, day) {
  const p = state.dayProgress[day.id];
  return Boolean(p && Object.values(p.done).some(Boolean)) || state.sessions.some((s) => s.trainingDayId === day.id);
}

/**
 * @param {import('./models.js').AppState} state
 * @param {import('./models.js').ScheduleEntry} entry
 * @param {string} today
 * @returns {'rest'|'done'|'today'|'partial'|'missed'|'upcoming'}
 */
export function entryStatus(state, entry, today) {
  if (entry.isRest || !entry.day) return 'rest';
  if (isDayComplete(state, entry.day)) return 'done';
  if (entry.date === today) return 'today';
  if (entry.date < today) return hasActivity(state, entry.day) ? 'partial' : 'missed';
  return 'upcoming';
}
