// @ts-check
import { entryStatus, isDayComplete } from './schedule.js';

/**
 * @param {import('./models.js').AppState} state
 * @param {import('./models.js').Schedule} schedule
 * @param {string} today
 */
export function computeStats(state, schedule, today) {
  const sessions = state.sessions;
  const totalMin = sessions.reduce((sum, s) => sum + (Number(s.durationMin) || 0), 0);
  const withDifficulty = sessions.filter((s) => Number(s.difficulty) > 0);
  const avgDifficulty = withDifficulty.length
    ? withDifficulty.reduce((sum, s) => sum + Number(s.difficulty), 0) / withDifficulty.length
    : 0;

  const training = schedule.training;
  const completedDays = training.filter((e) => e.day && isDayComplete(state, e.day)).length;
  // Consistency only looks at training days that have already happened; rest days never count.
  const elapsed = training.filter((e) => e.date <= today);
  const statuses = elapsed.map((e) => entryStatus(state, e, today));
  const practisedElapsed = statuses.filter((s) => s === 'done' || s === 'partial').length;
  const missed = statuses.filter((s) => s === 'missed').length;
  // Today only counts once something has been done, so an unstarted day isn't a "miss".
  const consistencyBase = elapsed.length - (statuses.at(-1) === 'today' ? 1 : 0);

  return {
    totalMin,
    sessionCount: sessions.length,
    avgMin: sessions.length ? totalMin / sessions.length : 0,
    avgDifficulty,
    completedDays,
    totalDays: training.length,
    programFraction: training.length ? completedDays / training.length : 0,
    missed,
    consistency: consistencyBase > 0 ? Math.min(1, practisedElapsed / consistencyBase) : null,
    freeSessions: sessions.filter((s) => !s.trainingDayId).length,
  };
}

/**
 * Practice minutes per week (weeks start on Monday), most recent last.
 * @param {import('./models.js').PracticeSession[]} sessions
 * @param {number} weeks
 * @param {string} today
 */
export function minutesPerWeek(sessions, weeks, today) {
  const toMonday = (/** @type {string} */ iso) => {
    const d = new Date(`${iso}T00:00:00Z`);
    const dow = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dow);
    return d.toISOString().slice(0, 10);
  };
  const current = toMonday(today);
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(`${current}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (weeks - 1 - i) * 7);
    return { week: d.toISOString().slice(0, 10), minutes: 0 };
  });
  const index = new Map(buckets.map((b, i) => [b.week, i]));
  for (const s of sessions) {
    const i = index.get(toMonday(s.date));
    if (i !== undefined) buckets[i].minutes += Number(s.durationMin) || 0;
  }
  return buckets;
}
