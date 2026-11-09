// @ts-check
import { entryStatus, formatDate, isDayComplete } from '../schedule.js';
import { checklist, esc, estimateDuration, fmtMin, setupNeeded, statusBadge } from '../ui.js';

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function programView(ctx) {
  const { schedule, program, state, today } = ctx;
  if (!schedule.configured) return { html: `<h1 class="page-title">Program</h1>${setupNeeded()}` };

  const warnings = schedule.warnings.map((w) => `<p class="notice">${esc(w)}</p>`).join('');
  const rows = schedule.entries
    .map((e) => {
      const status = entryStatus(state, e, today);
      if (e.isRest || !e.day) {
        return `<li class="row row-rest ${e.date === today ? 'is-today' : ''}">
          <span class="row-date">${esc(formatDate(e.date))}</span>
          <span class="row-main"><span class="row-title">Rest${e.restLabel ? ` — ${esc(e.restLabel)}` : ''}</span></span>
          ${statusBadge('rest')}</li>`;
      }
      return `<li><a class="row ${e.date === today ? 'is-today' : ''}" href="#/day/${esc(e.day.id)}">
        <span class="row-date">${esc(formatDate(e.date))}</span>
        <span class="row-main"><span class="row-title">Day ${e.slot} · ${esc(e.day.title)}</span><span class="row-sub">${esc(e.day.focus)} · ~${fmtMin(estimateDuration(ctx.lib, e.day))}</span></span>
        ${statusBadge(status)}</a></li>`;
    })
    .join('');

  return {
    html: `<h1 class="page-title">${esc(program.name)}</h1>
      <p class="lede">${esc(program.description)}</p>
      ${warnings}
      <section class="card">
        <p class="muted">Baseline assessment: record it before the first training day — <a href="#/assess/baseline">${state.assessments.baseline ? 'view baseline' : 'record baseline'}</a>.</p>
        <ul class="rows">${rows}</ul>
      </section>`,
  };
}

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function dayView(ctx) {
  const { schedule, program, state, today } = ctx;
  const id = ctx.route.args[0];
  const entry = schedule.training.find((e) => e.day?.id === id);
  const day = entry?.day ?? program.days.find((d) => d.id === id);
  if (!day) return { html: '<h1 class="page-title">Day not found</h1><p><a href="#/program">Back to program</a></p>' };

  const done = isDayComplete(state, day);
  const running = state.activeSession?.dayId === day.id;
  const sessions = state.sessions.filter((s) => s.trainingDayId === day.id);
  const idx = entry ? schedule.training.indexOf(entry) : -1;
  const prev = idx > 0 ? schedule.training[idx - 1] : null;
  const next = idx >= 0 && idx < schedule.training.length - 1 ? schedule.training[idx + 1] : null;

  return {
    html: `<nav class="crumbs"><a href="#/program">Program</a></nav>
      <section class="card hero">
        <div class="hero-head">
          <div>
            <p class="eyebrow">${entry ? `Day ${entry.slot} of ${schedule.training.length} · ${esc(formatDate(entry.date, { weekday: 'long', month: 'long', day: 'numeric' }))}` : 'Not in the current schedule'}</p>
            <h1>${esc(day.title)}</h1>
            <p class="muted">${esc(day.focus)} · ~${fmtMin(estimateDuration(ctx.lib, day))}</p>
          </div>
          ${entry ? statusBadge(entryStatus(state, entry, today)) : ''}
        </div>
        <p>${esc(day.instructions)}</p>
        ${checklist(ctx, day)}
        ${day.challenge ? `<p class="challenge"><strong>Challenge:</strong> ${esc(day.challenge)}</p>` : ''}
        <div class="actions">
          ${running
            ? '<button class="btn" data-action="finish-session">Finish & log session</button>'
            : `<button class="btn" data-action="start-session" data-day="${esc(day.id)}">Start session</button>`}
          <a class="btn btn-ghost" href="#/log/new?day=${esc(day.id)}">Log session</a>
          <button class="btn btn-ghost" data-action="toggle-complete" data-day="${esc(day.id)}">${done ? 'Mark not complete' : 'Mark day complete'}</button>
          ${day.isAssessment ? '<a class="btn btn-ghost" href="#/assess/final">Enter final assessment</a>' : ''}
        </div>
      </section>
      ${sessions.length ? `<section class="card"><h2 class="card-title">Logged sessions</h2><ul class="plain-list">${sessions
        .map((s) => `<li><a href="#/log/${esc(s.id)}">${esc(formatDate(s.date))}</a><span class="muted">${fmtMin(s.durationMin)} · difficulty ${esc(s.difficulty)}/10</span></li>`)
        .join('')}</ul></section>` : ''}
      <nav class="pager">
        ${prev?.day ? `<a class="btn btn-ghost btn-sm" href="#/day/${esc(prev.day.id)}">← ${esc(prev.day.title)}</a>` : '<span></span>'}
        ${next?.day ? `<a class="btn btn-ghost btn-sm" href="#/day/${esc(next.day.id)}">${esc(next.day.title)} →</a>` : ''}
      </nav>`,
  };
}
