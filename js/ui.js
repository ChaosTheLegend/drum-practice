// @ts-check
// Small, framework-free UI helpers and reusable components (HTML strings).

import { CATEGORIES } from './data/exercises.js';
import { formatDate } from './schedule.js';

/** Escape user-provided text for safe insertion into HTML. @param {unknown} v */
export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** @param {number} min */
export function fmtMin(min) {
  const m = Math.round(min || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
}

/** @param {import('./models.js').BpmRange|null|undefined} b */
export function bpmLabel(b) {
  if (!b) return '';
  return b.min === b.max ? `${b.min} BPM` : `${b.min}–${b.max} BPM`;
}

/** Looks like a URL? Render as a link, otherwise as text. @param {string} v */
export function linkOrText(v) {
  if (!v) return '<span class="muted">—</span>';
  return /^https?:\/\//i.test(v) ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v);
}

/** @param {number} fraction 0–1 @param {string} [label] */
export function progressBar(fraction, label = '') {
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  return `<div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}">
    <div class="progress-fill" style="width:${pct}%"></div></div>`;
}

const STATUS_LABEL = { rest: 'Rest', done: 'Done', today: 'Today', partial: 'Partial', missed: 'Missed', upcoming: 'Upcoming' };
/** @param {keyof typeof STATUS_LABEL} status */
export function statusBadge(status) {
  return `<span class="badge badge-${status}">${STATUS_LABEL[status]}</span>`;
}

/**
 * Exercise as used on a day: library defaults merged with day overrides.
 * @param {Map<string, import('./models.js').Exercise>} lib
 * @param {import('./models.js').DayItem} item
 */
export function resolveItem(lib, item) {
  const ex = lib.get(item.exerciseId);
  return {
    ex,
    name: ex?.name ?? `Unknown exercise (${item.exerciseId})`,
    bpm: item.targetBpm ?? ex?.targetBpm ?? null,
    subdivision: item.subdivision ?? ex?.subdivision ?? '',
    durationMin: item.durationMin ?? ex?.durationMin ?? 0,
    sets: item.sets ?? ex?.sets,
    reps: item.reps ?? ex?.reps,
    note: item.note ?? '',
  };
}

/** @param {Map<string, import('./models.js').Exercise>} lib @param {import('./models.js').TrainingDay} day */
export function estimateDuration(lib, day) {
  return day.items.reduce((sum, item) => sum + resolveItem(lib, item).durationMin, 0);
}

/** @param {ReturnType<typeof resolveItem>} r */
function metaChips(r) {
  const chips = [];
  if (r.durationMin) chips.push(fmtMin(r.durationMin));
  if (r.bpm) chips.push(bpmLabel(r.bpm));
  if (r.subdivision && r.subdivision !== 'mixed') chips.push(r.subdivision);
  if (r.sets && r.reps) chips.push(`${r.sets} × ${r.reps}`);
  else if (r.sets) chips.push(`${r.sets} sets`);
  return chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('');
}

/**
 * Exercise checklist for a training day.
 * @param {{state: import('./models.js').AppState, lib: Map<string, import('./models.js').Exercise>}} ctx
 * @param {import('./models.js').TrainingDay} day
 */
export function checklist(ctx, day) {
  const done = ctx.state.dayProgress[day.id]?.done ?? {};
  return `<ul class="checklist">${day.items
    .map((item, i) => {
      const r = resolveItem(ctx.lib, item);
      const checked = Boolean(done[i]);
      return `<li class="check-item ${checked ? 'is-done' : ''}">
        <button class="check" data-action="toggle-item" data-day="${esc(day.id)}" data-idx="${i}" aria-pressed="${checked}" aria-label="Mark ${esc(r.name)} ${checked ? 'not done' : 'done'}">${checked ? '✓' : ''}</button>
        <div class="check-body">
          <div class="check-title">${esc(r.name)}</div>
          <div class="chips">${metaChips(r)}</div>
          ${r.note ? `<p class="item-note">${esc(r.note)}</p>` : ''}
          ${r.ex ? `<details><summary>How to</summary><p>${esc(r.ex.instructions)}</p>${
            ctx.state.exerciseNotes[r.ex.id] ? `<p class="item-note">My notes: ${esc(ctx.state.exerciseNotes[r.ex.id])}</p>` : ''
          }</details>` : ''}
        </div>
      </li>`;
    })
    .join('')}</ul>`;
}

/** @param {import('./models.js').Exercise} ex */
export function exerciseCard(ex, notes = '') {
  return `<article class="card ex-card">
    <header class="ex-head">
      <h3>${esc(ex.name)}</h3>
      <span class="dots" title="Difficulty ${ex.difficulty}/5">${'●'.repeat(ex.difficulty)}${'○'.repeat(5 - ex.difficulty)}</span>
    </header>
    <div class="chips">
      <span class="chip chip-cat">${esc(CATEGORIES[ex.category] ?? ex.category)}</span>
      ${ex.targetBpm ? `<span class="chip">${bpmLabel(ex.targetBpm)}</span>` : ''}
      ${ex.subdivision ? `<span class="chip">${esc(ex.subdivision)}</span>` : ''}
      ${ex.durationMin ? `<span class="chip">${fmtMin(ex.durationMin)}</span>` : ''}
      ${ex.custom ? '<span class="chip chip-accent">custom</span>' : ''}
    </div>
    <p>${esc(ex.instructions)}</p>
    <label class="field"><span>Personal notes</span>
      <textarea rows="2" data-note="${esc(ex.id)}" placeholder="Stick heights, tempos that feel good, reminders…">${esc(notes)}</textarea>
    </label>
    ${ex.custom ? `<div class="actions"><button class="btn btn-ghost btn-danger" data-action="delete-exercise" data-id="${esc(ex.id)}">Delete</button></div>` : ''}
  </article>`;
}

/**
 * Minimal SVG line chart over dates.
 * @param {{name:string, cls:string, points:{date:string, y:number, label?:string}[]}[]} series
 */
export function lineChart(series, { height = 200, unit = 'BPM' } = {}) {
  const all = series.flatMap((s) => s.points);
  if (!all.length) return '<p class="muted">No data yet.</p>';
  const W = 600, H = height, pad = { l: 40, r: 12, t: 12, b: 26 };
  const xs = all.map((p) => Date.parse(p.date));
  const ys = all.map((p) => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  if (x0 === x1) { x0 -= 86400000; x1 += 86400000; }
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const ySpan = Math.max(10, y1 - y0);
  y0 = Math.max(0, Math.floor((y0 - ySpan * 0.15) / 5) * 5);
  y1 = Math.ceil((y1 + ySpan * 0.15) / 5) * 5;
  const sx = (/** @type {number} */ x) => pad.l + ((x - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const sy = (/** @type {number} */ y) => H - pad.b - ((y - y0) / (y1 - y0)) * (H - pad.t - pad.b);
  const ticks = [y0, Math.round((y0 + y1) / 2), y1];

  const grid = ticks
    .map((t) => `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${sy(t)}" y2="${sy(t)}"/><text class="axis" x="${pad.l - 6}" y="${sy(t) + 4}" text-anchor="end">${t}</text>`)
    .join('');
  const xLabels = `<text class="axis" x="${pad.l}" y="${H - 6}">${esc(formatDate(new Date(x0).toISOString().slice(0, 10), { month: 'short', day: 'numeric' }))}</text>
    <text class="axis" x="${W - pad.r}" y="${H - 6}" text-anchor="end">${esc(formatDate(new Date(x1).toISOString().slice(0, 10), { month: 'short', day: 'numeric' }))}</text>`;
  const lines = series
    .filter((s) => s.points.length)
    .map((s) => {
      const pts = [...s.points].sort((a, b) => a.date.localeCompare(b.date));
      const path = pts.map((p) => `${sx(Date.parse(p.date)).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
      const dots = pts
        .map((p) => `<circle class="dot ${s.cls}" cx="${sx(Date.parse(p.date)).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="4"><title>${esc(`${s.name}: ${p.y} ${unit} — ${formatDate(p.date)}${p.label ? ` (${p.label})` : ''}`)}</title></circle>`)
        .join('');
      return `<polyline class="line ${s.cls}" points="${path}"/>${dots}`;
    })
    .join('');
  const legend = series.map((s) => `<span class="legend-item"><i class="swatch ${s.cls}"></i>${esc(s.name)}</span>`).join('');
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map((s) => s.name).join(' and '))} over time">${grid}${xLabels}${lines}</svg><figcaption class="legend">${legend}</figcaption></figure>`;
}

/** @param {{label:string, value:number}[]} bars */
export function barChart(bars, { height = 160, unit = 'min' } = {}) {
  const W = 600, H = height, pad = { l: 8, r: 8, t: 18, b: 24 };
  const max = Math.max(1, ...bars.map((b) => b.value));
  const bw = (W - pad.l - pad.r) / bars.length;
  const body = bars
    .map((b, i) => {
      const h = (b.value / max) * (H - pad.t - pad.b);
      const x = pad.l + i * bw + bw * 0.15;
      const y = H - pad.b - h;
      return `<rect class="bar" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${Math.max(h, b.value ? 2 : 0).toFixed(1)}" rx="2"><title>${esc(`${b.label}: ${b.value} ${unit}`)}</title></rect>
        ${b.value ? `<text class="axis" x="${(x + bw * 0.35).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle">${b.value}</text>` : ''}
        <text class="axis" x="${(x + bw * 0.35).toFixed(1)}" y="${H - 7}" text-anchor="middle">${esc(b.label)}</text>`;
    })
    .join('');
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Practice ${unit} per week">${body}</svg></figure>`;
}

/** @param {string} title @param {string} body */
export function emptyState(title, body, action = '') {
  return `<section class="card empty"><h2>${esc(title)}</h2><p>${body}</p>${action}</section>`;
}

export function setupNeeded() {
  return emptyState(
    'Set up your program',
    'Choose a start date, an end date and your rest days. The 14 program days are laid out across the training days in that range, with the final assessment on the last one.',
    '<a class="btn" href="#/settings">Open settings</a>',
  );
}
