// @ts-check
import { formatDate } from '../schedule.js';
import { emptyState, esc, fmtMin, resolveItem, uid } from '../ui.js';

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function logView(ctx) {
  const arg = ctx.route.args[0];
  if (arg === 'new') return formView(ctx, null);
  if (arg) {
    const session = ctx.state.sessions.find((s) => s.id === arg);
    return session ? formView(ctx, session) : { html: '<h1 class="page-title">Entry not found</h1><p><a href="#/log">Back to log</a></p>' };
  }
  return listView(ctx);
}

/** @param {import('../models.js').ViewContext} ctx @param {string} dayId */
function dayLabel(ctx, dayId) {
  if (!dayId) return 'Free practice';
  const e = ctx.schedule.training.find((t) => t.day?.id === dayId);
  if (e?.day) return `Day ${e.slot} · ${e.day.title}`;
  return ctx.program.days.find((d) => d.id === dayId)?.title ?? 'Training day';
}

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
function listView(ctx) {
  const sessions = [...ctx.state.sessions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const body = sessions.length
    ? sessions
        .map((s) => `<article class="card log-card">
          <header class="log-head">
            <div><h3>${esc(formatDate(s.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))}</h3>
            <p class="muted">${esc(dayLabel(ctx, s.trainingDayId))}</p></div>
            <div class="chips"><span class="chip">${fmtMin(s.durationMin)}</span><span class="chip">difficulty ${esc(s.difficulty)}/10</span>${s.achievedBpm ? `<span class="chip">${esc(s.achievedBpm)} BPM</span>` : ''}</div>
          </header>
          ${s.notes ? `<p>${esc(s.notes)}</p>` : ''}
          <dl class="log-fields">
            ${s.wentWell ? `<div><dt>Went well</dt><dd>${esc(s.wentWell)}</dd></div>` : ''}
            ${s.improve ? `<div><dt>Needs work</dt><dd>${esc(s.improve)}</dd></div>` : ''}
            ${s.nextFocus ? `<div><dt>Next focus</dt><dd>${esc(s.nextFocus)}</dd></div>` : ''}
          </dl>
          <div class="actions"><a class="btn btn-ghost btn-sm" href="#/log/${esc(s.id)}">Edit</a></div>
        </article>`)
        .join('')
    : emptyState('No sessions yet', 'Start a session from Today, or log practice you did outside the program.');
  return {
    html: `<div class="title-row"><h1 class="page-title">Practice log</h1><a class="btn" href="#/log/new">New entry</a></div>${body}`,
  };
}

/**
 * @param {import('../models.js').ViewContext} ctx
 * @param {string} dayId
 * @param {number[]} selected
 */
function exerciseChecks(ctx, dayId, selected) {
  const entry = ctx.schedule.training.find((t) => t.day?.id === dayId);
  const day = entry?.day ?? ctx.program.days.find((d) => d.id === dayId);
  if (!day) return '<p class="muted">Free practice — no program exercises.</p>';
  return day.items
    .map((item, i) => `<label class="check-line"><input type="checkbox" name="ex" value="${i}" ${selected.includes(i) ? 'checked' : ''}> ${esc(resolveItem(ctx.lib, item).name)}</label>`)
    .join('');
}

/**
 * @param {import('../models.js').ViewContext} ctx
 * @param {import('../models.js').PracticeSession|null} existing
 * @returns {import('../models.js').ViewResult}
 */
function formView(ctx, existing) {
  const q = ctx.route.query;
  const todayEntry = ctx.schedule.training.find((t) => t.date === ctx.today);
  /** @type {import('../models.js').PracticeSession} */
  const s = existing ?? {
    id: '',
    date: q.get('date') || ctx.today,
    trainingDayId: q.has('day') ? q.get('day') ?? '' : todayEntry?.day?.id ?? '',
    durationMin: Number(q.get('min')) || 0,
    difficulty: 5,
    achievedBpm: '',
    completedExercises: [],
    notes: '',
    wentWell: '',
    improve: '',
    nextFocus: '',
  };
  if (!existing && s.trainingDayId) {
    // Pre-tick what's already checked off on the day.
    const done = ctx.state.dayProgress[s.trainingDayId]?.done ?? {};
    s.completedExercises = Object.keys(done).filter((k) => done[k]).map(Number);
  }

  const dayOptions = ctx.schedule.training
    .map((e) => e.day && `<option value="${esc(e.day.id)}" ${e.day.id === s.trainingDayId ? 'selected' : ''}>Day ${e.slot} · ${esc(e.day.title)} (${esc(formatDate(e.date))})</option>`)
    .join('');

  const html = `<nav class="crumbs"><a href="#/log">Practice log</a></nav>
    <h1 class="page-title">${existing ? 'Edit session' : 'Log a session'}</h1>
    <form class="card form" id="session-form">
      <div class="form-grid">
        <label class="field"><span>Date</span><input type="date" name="date" value="${esc(s.date)}" required></label>
        <label class="field"><span>Training day</span>
          <select name="trainingDayId"><option value="">Free practice (outside program)</option>${dayOptions}</select></label>
        <label class="field"><span>Duration (minutes)</span><input type="number" name="durationMin" min="0" max="600" value="${s.durationMin || ''}" required inputmode="numeric"></label>
        <label class="field"><span>BPM achieved</span><input type="text" name="achievedBpm" value="${esc(s.achievedBpm)}" placeholder="e.g. singles 120, thrash 165"></label>
      </div>
      <label class="field"><span>Perceived difficulty: <output id="diff-out">${s.difficulty}</output>/10</span>
        <input type="range" name="difficulty" min="1" max="10" value="${s.difficulty}"></label>
      <fieldset class="field"><legend>Exercises completed</legend><div id="ex-list" class="check-lines">${exerciseChecks(ctx, s.trainingDayId, s.completedExercises)}</div></fieldset>
      <label class="field"><span>Observations</span><textarea name="notes" rows="3">${esc(s.notes)}</textarea></label>
      <div class="form-grid">
        <label class="field"><span>What went well</span><textarea name="wentWell" rows="2">${esc(s.wentWell)}</textarea></label>
        <label class="field"><span>What needs improvement</span><textarea name="improve" rows="2">${esc(s.improve)}</textarea></label>
      </div>
      <label class="field"><span>Focus for next session</span><input type="text" name="nextFocus" value="${esc(s.nextFocus)}"></label>
      <div class="actions">
        <button class="btn" type="submit">${existing ? 'Save changes' : 'Save session'}</button>
        <a class="btn btn-ghost" href="#/log">Cancel</a>
        ${existing ? '<button class="btn btn-ghost btn-danger" type="button" id="delete-session">Delete</button>' : ''}
      </div>
    </form>`;

  /** @param {HTMLElement} root */
  const mount = (root) => {
    const form = /** @type {HTMLFormElement} */ (root.querySelector('#session-form'));
    const daySelect = /** @type {HTMLSelectElement} */ (form.elements.namedItem('trainingDayId'));
    const range = /** @type {HTMLInputElement} */ (form.elements.namedItem('difficulty'));
    const out = /** @type {HTMLOutputElement} */ (root.querySelector('#diff-out'));
    range.addEventListener('input', () => (out.value = range.value));
    daySelect.addEventListener('change', () => {
      const done = ctx.state.dayProgress[daySelect.value]?.done ?? {};
      const pre = Object.keys(done).filter((k) => done[k]).map(Number);
      /** @type {HTMLElement} */ (root.querySelector('#ex-list')).innerHTML = exerciseChecks(ctx, daySelect.value, pre);
    });

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const str = (/** @type {string} */ k) => String(fd.get(k) ?? '').trim();
      /** @type {import('../models.js').PracticeSession} */
      const record = {
        id: existing?.id || uid(),
        date: str('date'),
        trainingDayId: str('trainingDayId'),
        durationMin: Number(str('durationMin')) || 0,
        difficulty: Number(str('difficulty')) || 5,
        achievedBpm: str('achievedBpm'),
        completedExercises: fd.getAll('ex').map(Number),
        notes: str('notes'),
        wentWell: str('wentWell'),
        improve: str('improve'),
        nextFocus: str('nextFocus'),
      };
      ctx.store.update((st) => {
        const i = st.sessions.findIndex((x) => x.id === record.id);
        if (i >= 0) st.sessions[i] = record;
        else st.sessions.push(record);
        if (record.trainingDayId) {
          const p = (st.dayProgress[record.trainingDayId] ??= { done: {}, manual: false });
          record.completedExercises.forEach((idx) => (p.done[idx] = true));
        }
      }, { silent: true });
      ctx.go('#/log');
    });

    root.querySelector('#delete-session')?.addEventListener('click', () => {
      if (!existing || !confirm('Delete this session?')) return;
      ctx.store.update((st) => (st.sessions = st.sessions.filter((x) => x.id !== existing.id)), { silent: true });
      ctx.go('#/log');
    });
  };

  return { html, mount };
}
