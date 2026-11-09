// @ts-check
// Baseline / final assessment entry and comparison.
import { ASSESSMENT_BENCHMARKS, SUBDIVISIONS } from '../data/exercises.js';
import { formatDate } from '../schedule.js';
import { computeStats } from '../stats.js';
import { esc, linkOrText } from '../ui.js';

const OBS = /** @type {const} */ (['endurance', 'coordination', 'consistency', 'musicality']);
const KIND_LABEL = { baseline: 'Baseline', final: 'Final' };

/** @returns {import('../models.js').Assessment} */
function emptyAssessment(date = '') {
  return {
    date,
    song: '',
    songRecording: '',
    improvisationRecording: '',
    songDifficulty: null,
    benchmarks: ASSESSMENT_BENCHMARKS.map((exerciseId) => ({ exerciseId, max: null, clean: null, subdivision: exerciseId === 'thrash-beat' || exerciseId === 'kick-endurance' ? 'eighths' : 'sixteenths' })),
    observations: { endurance: '', coordination: '', consistency: '', musicality: '' },
    strengths: '',
    weaknesses: '',
    notes: '',
  };
}

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function assessView(ctx) {
  const kind = ctx.route.args[0];
  if (kind === 'baseline' || kind === 'final') return editView(ctx, kind);
  return overview(ctx);
}

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
function overview(ctx) {
  const { baseline, final } = ctx.state.assessments;
  const summary = (/** @type {'baseline'|'final'} */ kind, /** @type {import('../models.js').Assessment|null} */ a) => `<section class="card">
    <header class="title-row"><h2 class="card-title">${KIND_LABEL[kind]} assessment</h2>
      <a class="btn btn-sm ${a ? 'btn-ghost' : ''}" href="#/assess/${kind}">${a ? 'Edit' : 'Record'}</a></header>
    ${a
      ? `<p class="muted">${esc(formatDate(a.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))}${a.song ? ` · ${esc(a.song)}` : ''}</p>
         <dl class="log-fields"><div><dt>Song recording</dt><dd>${linkOrText(a.songRecording)}</dd></div>
         <div><dt>Improvisation</dt><dd>${linkOrText(a.improvisationRecording)}</dd></div></dl>`
      : `<p class="muted">${kind === 'baseline' ? 'Record before the first training day.' : 'Record on the last training day, under the same conditions as the baseline.'}</p>`}
  </section>`;

  const steps = `<section class="card"><h2 class="card-title">What to record</h2><ol class="steps">
      <li>A familiar but challenging song, start to finish, in one take.</li>
      <li>Two minutes of natural improvisation.</li>
      <li>Max and clean BPM for singles, doubles, paradiddles, kick and thrash beat.</li>
      <li>Observations on endurance, coordination, consistency and musicality.</li>
    </ol><p class="muted">Recordings stay on your device or cloud — paste a filename or link.</p></section>`;

  return {
    html: `<h1 class="page-title">Assessment</h1>
      <div class="grid-2">${summary('baseline', baseline)}${summary('final', final)}</div>
      ${baseline && final ? comparison(ctx, baseline, final) : steps}`,
  };
}

/**
 * @param {import('../models.js').ViewContext} ctx
 * @param {import('../models.js').Assessment} a
 * @param {import('../models.js').Assessment} b
 */
function comparison(ctx, a, b) {
  const stats = computeStats(ctx.state, ctx.schedule, ctx.today);
  const delta = (/** @type {number|null} */ x, /** @type {number|null} */ y) => {
    if (!x || !y) return '<span class="muted">—</span>';
    const d = y - x;
    const pct = Math.round((d / x) * 100);
    return `<span class="${d > 0 ? 'pos' : d < 0 ? 'neg' : ''}">${d > 0 ? '+' : ''}${d} (${pct > 0 ? '+' : ''}${pct}%)</span>`;
  };
  const rows = ASSESSMENT_BENCHMARKS.map((id) => {
    const x = a.benchmarks.find((m) => m.exerciseId === id);
    const y = b.benchmarks.find((m) => m.exerciseId === id);
    return `<tr><td>${esc(ctx.lib.get(id)?.name ?? id)}</td>
      <td>${x?.max ?? '—'}</td><td>${y?.max ?? '—'}</td><td>${delta(x?.max ?? null, y?.max ?? null)}</td>
      <td>${x?.clean ?? '—'}</td><td>${y?.clean ?? '—'}</td><td>${delta(x?.clean ?? null, y?.clean ?? null)}</td></tr>`;
  }).join('');

  const side = (/** @type {string} */ label, /** @type {string} */ x, /** @type {string} */ y) =>
    `<tr><th scope="row">${esc(label)}</th><td>${esc(x) || '<span class="muted">—</span>'}</td><td>${esc(y) || '<span class="muted">—</span>'}</td></tr>`;

  return `<section class="card">
    <h2 class="card-title">Baseline vs. final</h2>
    <div class="table-wrap"><table class="compare">
      <thead><tr><th rowspan="2">Exercise</th><th colspan="3">Max BPM</th><th colspan="3">Clean BPM</th></tr>
      <tr><th>Before</th><th>After</th><th>Change</th><th>Before</th><th>After</th><th>Change</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <dl class="mini-stats">
      <div><dt>Training days done</dt><dd>${stats.completedDays}/${stats.totalDays}</dd></div>
      <div><dt>Consistency</dt><dd>${stats.consistency === null ? '—' : `${Math.round(stats.consistency * 100)}%`}</dd></div>
      <div><dt>Avg. session difficulty</dt><dd>${stats.avgDifficulty ? stats.avgDifficulty.toFixed(1) : '—'}</dd></div>
      <div><dt>Song difficulty</dt><dd>${a.songDifficulty ?? '—'} → ${b.songDifficulty ?? '—'}</dd></div>
    </dl>
  </section>
  <section class="card">
    <h2 class="card-title">Notes side by side</h2>
    <div class="table-wrap"><table class="compare notes-table">
      <thead><tr><th></th><th>Baseline · ${esc(formatDate(a.date))}</th><th>Final · ${esc(formatDate(b.date))}</th></tr></thead>
      <tbody>
        ${side('Song', a.song, b.song)}
        ${OBS.map((k) => side(k[0].toUpperCase() + k.slice(1), a.observations[k], b.observations[k])).join('')}
        ${side('Strengths', a.strengths, b.strengths)}
        ${side('Weaknesses', a.weaknesses, b.weaknesses)}
        ${side('Notes', a.notes, b.notes)}
      </tbody></table></div>
  </section>`;
}

/**
 * @param {import('../models.js').ViewContext} ctx
 * @param {'baseline'|'final'} kind
 * @returns {import('../models.js').ViewResult}
 */
function editView(ctx, kind) {
  const existing = ctx.state.assessments[kind];
  const defaultDate = kind === 'final' ? ctx.schedule.training.at(-1)?.date ?? ctx.today : ctx.today;
  const a = existing ?? emptyAssessment(defaultDate);
  const other = ctx.state.assessments[kind === 'final' ? 'baseline' : 'final'];
  if (!existing && kind === 'final' && other?.song) a.song = other.song;

  const benchRows = ASSESSMENT_BENCHMARKS.map((id, i) => {
    const m = a.benchmarks.find((b) => b.exerciseId === id) ?? { exerciseId: id, max: null, clean: null, subdivision: 'sixteenths' };
    const prev = other?.benchmarks.find((b) => b.exerciseId === id);
    return `<tr>
      <td>${esc(ctx.lib.get(id)?.name ?? id)}${prev && (prev.max || prev.clean) ? `<div class="muted small">${KIND_LABEL[kind === 'final' ? 'baseline' : 'final']}: ${prev.max ?? '—'} / ${prev.clean ?? '—'}</div>` : ''}</td>
      <td><input type="number" name="max-${i}" min="20" max="400" value="${m.max ?? ''}" inputmode="numeric" aria-label="Max BPM"></td>
      <td><input type="number" name="clean-${i}" min="20" max="400" value="${m.clean ?? ''}" inputmode="numeric" aria-label="Clean BPM"></td>
      <td><select name="sub-${i}" aria-label="Subdivision">${SUBDIVISIONS.map((s) => `<option ${s === m.subdivision ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></td>
    </tr>`;
  }).join('');

  const html = `<nav class="crumbs"><a href="#/assess">Assessment</a></nav>
    <h1 class="page-title">${KIND_LABEL[kind]} assessment</h1>
    ${kind === 'final' ? '<p class="lede">Repeat the baseline exactly: same song, same kit settings, same recording setup, same warm-up.</p>' : '<p class="lede">This is your reference point. Play naturally — it isn’t a test you can fail.</p>'}
    <form id="assess-form" class="card form">
      <div class="form-grid">
        <label class="field"><span>Date</span><input type="date" name="date" value="${esc(a.date)}" required></label>
        <label class="field"><span>Song</span><input type="text" name="song" value="${esc(a.song)}" placeholder="Artist — title"></label>
        <label class="field"><span>Song recording (file or link)</span><input type="text" name="songRecording" value="${esc(a.songRecording)}"></label>
        <label class="field"><span>Improvisation recording (file or link)</span><input type="text" name="improvisationRecording" value="${esc(a.improvisationRecording)}"></label>
        <label class="field"><span>How hard did the song feel? (1–10)</span><input type="number" name="songDifficulty" min="1" max="10" value="${a.songDifficulty ?? ''}" inputmode="numeric"></label>
      </div>
      <h2 class="card-title">BPM</h2>
      <p class="muted small">Max = fastest you can hold for ~30 s. Clean = fastest you can play relaxed and even for 60 s.</p>
      <div class="table-wrap"><table class="input-table"><thead><tr><th>Exercise</th><th>Max</th><th>Clean</th><th>Subdivision</th></tr></thead><tbody>${benchRows}</tbody></table></div>
      <h2 class="card-title">Observations</h2>
      <div class="form-grid">
        ${OBS.map((k) => `<label class="field"><span>${k[0].toUpperCase() + k.slice(1)}</span><textarea name="obs-${k}" rows="2">${esc(a.observations[k])}</textarea></label>`).join('')}
        <label class="field"><span>Strengths / improvements</span><textarea name="strengths" rows="2">${esc(a.strengths)}</textarea></label>
        <label class="field"><span>Weaknesses remaining</span><textarea name="weaknesses" rows="2">${esc(a.weaknesses)}</textarea></label>
      </div>
      <label class="field"><span>Other notes</span><textarea name="notes" rows="3">${esc(a.notes)}</textarea></label>
      <div class="actions">
        <button class="btn" type="submit">Save</button>
        <a class="btn btn-ghost" href="#/assess">Cancel</a>
        ${existing ? '<button class="btn btn-ghost btn-danger" type="button" id="delete-assessment">Delete</button>' : ''}
      </div>
    </form>`;

  /** @param {HTMLElement} root */
  const mount = (root) => {
    const form = /** @type {HTMLFormElement} */ (root.querySelector('#assess-form'));
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const str = (/** @type {string} */ k) => String(fd.get(k) ?? '').trim();
      const num = (/** @type {string} */ k) => (str(k) ? Number(str(k)) : null);
      /** @type {import('../models.js').Assessment} */
      const record = {
        date: str('date'),
        song: str('song'),
        songRecording: str('songRecording'),
        improvisationRecording: str('improvisationRecording'),
        songDifficulty: num('songDifficulty'),
        benchmarks: ASSESSMENT_BENCHMARKS.map((exerciseId, i) => ({ exerciseId, max: num(`max-${i}`), clean: num(`clean-${i}`), subdivision: str(`sub-${i}`) })),
        observations: { endurance: str('obs-endurance'), coordination: str('obs-coordination'), consistency: str('obs-consistency'), musicality: str('obs-musicality') },
        strengths: str('strengths'),
        weaknesses: str('weaknesses'),
        notes: str('notes'),
      };
      ctx.store.update((st) => (st.assessments[kind] = record), { silent: true });
      ctx.go('#/assess');
    });
    root.querySelector('#delete-assessment')?.addEventListener('click', () => {
      if (!confirm(`Delete the ${kind} assessment?`)) return;
      ctx.store.update((st) => (st.assessments[kind] = null), { silent: true });
      ctx.go('#/assess');
    });
  };

  return { html, mount };
}
