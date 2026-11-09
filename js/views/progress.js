// @ts-check
// Technical benchmarks: BPM history with max vs. sustainable speed.
import { SUBDIVISIONS } from '../data/exercises.js';
import { formatDate } from '../schedule.js';
import { emptyState, esc, lineChart, uid } from '../ui.js';

/**
 * Benchmarks plus the BPM values entered in assessments, as one list.
 * @param {import('../models.js').AppState} state
 */
export function allMeasurements(state) {
  /** @type {(import('../models.js').TechnicalBenchmark & {source?: string})[]} */
  const list = [...state.benchmarks];
  for (const kind of /** @type {const} */ (['baseline', 'final'])) {
    const a = state.assessments[kind];
    if (!a?.date) continue;
    for (const b of a.benchmarks) {
      const base = { exerciseId: b.exerciseId, date: a.date, subdivision: b.subdivision, duration: '', notes: '', source: kind };
      if (b.max) list.push({ ...base, id: `${kind}-${b.exerciseId}-max`, bpm: b.max, type: 'max', isClean: false });
      if (b.clean) list.push({ ...base, id: `${kind}-${b.exerciseId}-clean`, bpm: b.clean, type: 'sustained', isClean: true });
    }
  }
  return list;
}

// Keep the "Add measurement" panel open across re-renders while entering several results.
let panelOpen = false;

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function progressView(ctx) {
  const { state, lib, today } = ctx;
  const all = [...lib.values()].filter((e) => e.category !== 'assessment');
  const featured = all.filter((e) => e.isBenchmark);
  const others = all.filter((e) => !e.isBenchmark);
  const option = (/** @type {import('../models.js').Exercise} */ e) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`;

  const measurements = allMeasurements(state);
  const byExercise = new Map();
  for (const m of measurements) {
    if (!byExercise.has(m.exerciseId)) byExercise.set(m.exerciseId, []);
    byExercise.get(m.exerciseId).push(m);
  }

  const cards = [...byExercise.entries()]
    .map(([exId, list]) => {
      const ex = lib.get(exId);
      const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
      const max = sorted.filter((m) => m.type === 'max');
      const sustained = sorted.filter((m) => m.type === 'sustained' && m.isClean);
      const best = (/** @type {typeof list} */ l) => (l.length ? Math.max(...l.map((m) => m.bpm)) : null);
      const chart = lineChart([
        { name: 'Max (burst)', cls: 's-max', points: max.map((m) => ({ date: m.date, y: m.bpm, label: m.source })) },
        { name: 'Sustainable & clean', cls: 's-clean', points: sustained.map((m) => ({ date: m.date, y: m.bpm, label: m.source })) },
      ]);
      const rows = sorted
        .map((m) => `<tr>
          <td>${esc(formatDate(m.date))}</td>
          <td>${m.bpm}</td>
          <td>${m.type === 'max' ? 'Max' : 'Sustainable'}</td>
          <td>${esc(m.subdivision)}</td>
          <td>${m.isClean ? '✓' : '<span class="muted">✗</span>'}</td>
          <td class="muted">${esc(m.source ? `${m.source} assessment` : [m.duration, m.notes].filter(Boolean).join(' · '))}</td>
          <td>${m.source ? '' : `<button class="btn-icon" data-action="delete-benchmark" data-id="${esc(m.id)}" aria-label="Delete measurement">×</button>`}</td>
        </tr>`)
        .join('');
      return `<section class="card">
        <header class="title-row"><h2 class="card-title">${esc(ex?.name ?? exId)}</h2>
          <div class="chips"><span class="chip">best max ${best(max) ?? '—'}</span><span class="chip chip-accent">best clean ${best(sustained) ?? '—'}</span></div></header>
        ${chart}
        <div class="table-wrap"><table><thead><tr><th>Date</th><th>BPM</th><th>Type</th><th>Subdivision</th><th>Clean</th><th>Notes</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>`;
    })
    .join('');

  const html = `<h1 class="page-title">BPM & technique</h1>
    <p class="lede">Log both numbers: the fastest you can manage (max) and the fastest you can hold cleanly and relaxed (sustainable). Only the second one is really yours.</p>
    <details class="card add-panel" id="bench-panel" ${panelOpen || !measurements.length ? 'open' : ''}>
      <summary>Add measurement</summary>
      <form id="bench-form" class="form">
        <div class="form-grid">
          <label class="field"><span>Exercise</span><select name="exerciseId" required>
            <optgroup label="Core benchmarks">${featured.map(option).join('')}</optgroup>
            <optgroup label="Other exercises">${others.map(option).join('')}</optgroup></select></label>
          <label class="field"><span>Date</span><input type="date" name="date" value="${esc(today)}" required></label>
          <label class="field"><span>BPM</span><input type="number" name="bpm" min="20" max="400" required inputmode="numeric"></label>
          <label class="field"><span>Subdivision</span><select name="subdivision">${SUBDIVISIONS.map((s) => `<option ${s === 'sixteenths' ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
          <label class="field"><span>Type</span><select name="type"><option value="sustained">Sustainable (controlled)</option><option value="max">Max (burst)</option></select></label>
          <label class="field"><span>Duration / reps</span><input type="text" name="duration" placeholder="60 s, 4 × 16…"></label>
        </div>
        <label class="check-line"><input type="checkbox" name="isClean" checked> Clean and consistent</label>
        <label class="field"><span>Notes</span><input type="text" name="notes"></label>
        <div class="actions"><button class="btn" type="submit">Add</button></div>
      </form>
    </details>
    ${cards || emptyState('No measurements yet', 'Add your first one above, or enter BPM results in the baseline assessment.')}`;

  /** @param {HTMLElement} root */
  const mount = (root) => {
    const panel = /** @type {HTMLDetailsElement} */ (root.querySelector('#bench-panel'));
    panel.addEventListener('toggle', () => (panelOpen = panel.open));
    const form = /** @type {HTMLFormElement} */ (root.querySelector('#bench-form'));
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const str = (/** @type {string} */ k) => String(fd.get(k) ?? '').trim();
      ctx.store.update((st) => {
        st.benchmarks.push({
          id: uid(),
          exerciseId: str('exerciseId'),
          date: str('date'),
          bpm: Number(str('bpm')),
          subdivision: str('subdivision'),
          type: str('type') === 'max' ? 'max' : 'sustained',
          duration: str('duration'),
          isClean: fd.get('isClean') === 'on',
          notes: str('notes'),
        });
      });
    });
  };

  return { html, mount };
}
