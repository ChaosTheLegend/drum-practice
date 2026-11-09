// @ts-check
import { diffDays, formatDate, isDayComplete } from '../schedule.js';
import { computeStats } from '../stats.js';
import { checklist, esc, estimateDuration, fmtMin, progressBar, setupNeeded, statusBadge } from '../ui.js';
import { entryStatus } from '../schedule.js';

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function dashboardView(ctx) {
  const { state, schedule, today, program } = ctx;
  if (!schedule.configured) return { html: `<h1 class="page-title">Today</h1>${setupNeeded()}` };

  const stats = computeStats(state, schedule, today);
  const start = schedule.entries[0].date;
  const end = schedule.entries[schedule.entries.length - 1].date;
  const todayEntry = schedule.entries.find((e) => e.date === today);
  const nextTraining = schedule.training.find((e) => e.date > today);
  const upcomingRest = schedule.entries.filter((e) => e.isRest && e.date >= today).slice(0, 4);

  let hero = '';
  if (today < start) {
    const days = diffDays(today, start);
    hero = `<section class="card hero">
      <p class="eyebrow">${esc(program.name)}</p>
      <h2>Starts in ${days} day${days > 1 ? 's' : ''} · ${esc(formatDate(start))}</h2>
      <p>Record your baseline before Day 1: one full song, two minutes of improvisation and clean max BPM for the core exercises.</p>
      <div class="actions">
        <a class="btn" href="#/assess/baseline">${state.assessments.baseline ? 'Edit baseline' : 'Record baseline'}</a>
        <a class="btn btn-ghost" href="#/program">Preview program</a>
      </div></section>`;
  } else if (today > end) {
    hero = `<section class="card hero">
      <p class="eyebrow">${esc(program.name)}</p>
      <h2>Program finished</h2>
      <p>${stats.completedDays} of ${stats.totalDays} training days completed. Compare your baseline and final assessment to see what changed.</p>
      <div class="actions"><a class="btn" href="#/assess">Compare assessments</a><a class="btn btn-ghost" href="#/settings">Plan a new block</a></div>
    </section>`;
  } else if (todayEntry?.isRest) {
    hero = `<section class="card hero hero-rest">
      <p class="eyebrow">${esc(formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }))}</p>
      <h2>Rest day${todayEntry.restLabel ? ` — ${esc(todayEntry.restLabel)}` : ''}</h2>
      <p>Recovery is part of the plan and doesn't count against your progress. Want to play anyway? Log it as free practice.</p>
      ${nextTraining?.day ? `<p class="muted">Next: Day ${nextTraining.slot} · ${esc(nextTraining.day.title)} — ${esc(formatDate(nextTraining.date))}</p>` : ''}
      <div class="actions"><a class="btn btn-ghost" href="#/log/new?day=">Log free practice</a></div>
    </section>`;
  } else if (todayEntry?.day) {
    const day = todayEntry.day;
    const done = isDayComplete(state, day);
    const running = state.activeSession?.dayId === day.id;
    hero = `<section class="card hero">
      <div class="hero-head">
        <div>
          <p class="eyebrow">Day ${todayEntry.slot} of ${schedule.training.length} · ${esc(formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }))}</p>
          <h2>${esc(day.title)}</h2>
          <p class="muted">${esc(day.focus)} · ~${fmtMin(estimateDuration(ctx.lib, day))}</p>
        </div>
        ${statusBadge(entryStatus(state, todayEntry, today))}
      </div>
      <p>${esc(day.instructions)}</p>
      ${checklist(ctx, day)}
      ${day.challenge ? `<p class="challenge"><strong>Challenge:</strong> ${esc(day.challenge)}</p>` : ''}
      <div class="actions">
        ${running
          ? '<button class="btn" data-action="finish-session">Finish & log session</button>'
          : `<button class="btn" data-action="start-session" data-day="${esc(day.id)}">Start session</button>`}
        <a class="btn btn-ghost" href="#/log/new?day=${esc(day.id)}">Log without timer</a>
        <button class="btn btn-ghost" data-action="toggle-complete" data-day="${esc(day.id)}">${done ? 'Mark not complete' : 'Mark day complete'}</button>
        ${day.isAssessment ? '<a class="btn btn-ghost" href="#/assess/final">Enter final assessment</a>' : ''}
      </div>
    </section>`;
  }

  const consistency = stats.consistency === null ? '—' : `${Math.round(stats.consistency * 100)}%`;
  const progress = `<section class="card">
    <h2 class="card-title">Program progress</h2>
    ${progressBar(stats.programFraction, 'Program progress')}
    <p class="progress-label"><strong>${stats.completedDays}</strong> / ${stats.totalDays} training days complete · ${esc(formatDate(start))} – ${esc(formatDate(end))}</p>
    <dl class="mini-stats">
      <div><dt>Consistency</dt><dd>${consistency}</dd></div>
      <div><dt>Missed</dt><dd>${stats.missed}</dd></div>
      <div><dt>Practice time</dt><dd>${fmtMin(stats.totalMin)}</dd></div>
      <div><dt>Sessions</dt><dd>${stats.sessionCount}</dd></div>
    </dl>
  </section>`;

  const rest = `<section class="card">
    <h2 class="card-title">Upcoming rest days</h2>
    ${upcomingRest.length
      ? `<ul class="plain-list">${upcomingRest.map((e) => `<li><span>${esc(formatDate(e.date))}</span><span class="muted">${esc(e.restLabel || 'Rest')}</span></li>`).join('')}</ul>`
      : '<p class="muted">None left in this program.</p>'}
  </section>`;

  const recent = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const recentHtml = `<section class="card">
    <h2 class="card-title">Recent sessions</h2>
    ${recent.length
      ? `<ul class="plain-list">${recent.map((s) => `<li><a href="#/log/${esc(s.id)}">${esc(formatDate(s.date))}</a><span class="muted">${fmtMin(s.durationMin)} · difficulty ${esc(s.difficulty)}/10</span></li>`).join('')}</ul>`
      : '<p class="muted">Nothing logged yet.</p>'}
    <div class="actions"><a class="btn btn-ghost btn-sm" href="#/log">Practice log</a><a class="btn btn-ghost btn-sm" href="#/progress">BPM progress</a><a class="btn btn-ghost btn-sm" href="#/log/new?day=">Log free practice</a></div>
  </section>`;

  return {
    html: `<h1 class="page-title">Today</h1>${hero}<div class="grid-2">${progress}${rest}</div>${recentHtml}`,
  };
}
