// @ts-check
import { computeStats, minutesPerWeek } from '../stats.js';
import { formatDate } from '../schedule.js';
import { barChart, esc, fmtMin, progressBar } from '../ui.js';
import { allMeasurements } from './progress.js';

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function statsView(ctx) {
  const { state, schedule, today, lib } = ctx;
  const s = computeStats(state, schedule, today);
  const weeks = minutesPerWeek(state.sessions, 8, today).map((w) => ({ label: formatDate(w.week, { month: 'short', day: 'numeric' }), value: w.minutes }));

  // Best clean (sustainable) BPM per exercise, first vs. latest.
  const byEx = new Map();
  for (const m of allMeasurements(state).filter((m) => m.type === 'sustained' && m.isClean)) {
    const list = byEx.get(m.exerciseId) ?? [];
    list.push(m);
    byEx.set(m.exerciseId, list);
  }
  const bpmRows = [...byEx.entries()]
    .map(([id, list]) => {
      list.sort((/** @type {any} */ a, /** @type {any} */ b) => a.date.localeCompare(b.date));
      const first = list[0].bpm, last = list[list.length - 1].bpm, best = Math.max(...list.map((/** @type {any} */ m) => m.bpm));
      const d = last - first;
      return `<tr><td>${esc(lib.get(id)?.name ?? id)}</td><td>${first}</td><td>${last}</td><td>${best}</td><td class="${d > 0 ? 'pos' : d < 0 ? 'neg' : ''}">${d > 0 ? '+' : ''}${d}</td></tr>`;
    })
    .join('');

  const tile = (/** @type {string} */ label, /** @type {string} */ value, sub = '') =>
    `<div class="tile"><div class="tile-label">${esc(label)}</div><div class="tile-value">${value}</div>${sub ? `<div class="tile-sub">${sub}</div>` : ''}</div>`;

  return {
    html: `<h1 class="page-title">Statistics</h1>
      <div class="tiles">
        ${tile('Total practice', fmtMin(s.totalMin))}
        ${tile('Sessions', String(s.sessionCount), s.freeSessions ? `${s.freeSessions} free practice` : '')}
        ${tile('Avg. session', s.sessionCount ? fmtMin(s.avgMin) : '—')}
        ${tile('Consistency', s.consistency === null ? '—' : `${Math.round(s.consistency * 100)}%`, 'training days practised; rest days excluded')}
        ${tile('Avg. difficulty', s.avgDifficulty ? `${s.avgDifficulty.toFixed(1)}/10` : '—')}
        ${tile('Program', `${s.completedDays}/${s.totalDays}`, 'days complete')}
      </div>
      ${schedule.configured ? `<section class="card"><h2 class="card-title">Program completion</h2>${progressBar(s.programFraction)}</section>` : ''}
      <section class="card"><h2 class="card-title">Practice minutes per week</h2>${barChart(weeks)}</section>
      <section class="card"><h2 class="card-title">Clean BPM — first vs. latest</h2>
        ${bpmRows
          ? `<div class="table-wrap"><table><thead><tr><th>Exercise</th><th>First</th><th>Latest</th><th>Best</th><th>Change</th></tr></thead><tbody>${bpmRows}</tbody></table></div>`
          : '<p class="muted">No clean measurements yet.</p>'}
        <div class="actions"><a class="btn btn-ghost btn-sm" href="#/progress">BPM charts</a><a class="btn btn-ghost btn-sm" href="#/assess">Assessment comparison</a></div>
      </section>`,
  };
}
