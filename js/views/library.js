// @ts-check
import { CATEGORIES, SUBDIVISIONS } from '../data/exercises.js';
import { esc, exerciseCard, uid } from '../ui.js';

let filter = { category: '', q: '' };

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function libraryView(ctx) {
  const { lib, state } = ctx;
  const matches = (/** @type {import('../models.js').Exercise} */ e) =>
    (!filter.category || e.category === filter.category) &&
    (!filter.q || `${e.name} ${e.instructions}`.toLowerCase().includes(filter.q.toLowerCase()));
  const list = [...lib.values()].filter(matches);

  const groups = Object.entries(CATEGORIES)
    .map(([key, label]) => {
      const items = list.filter((e) => e.category === key);
      if (!items.length) return '';
      return `<h2 class="section-title">${esc(label)}</h2><div class="grid-2">${items.map((e) => exerciseCard(e, state.exerciseNotes[e.id])).join('')}</div>`;
    })
    .join('');

  const html = `<h1 class="page-title">Exercise library</h1>
    <div class="toolbar">
      <input type="search" id="lib-q" placeholder="Search exercises" value="${esc(filter.q)}" aria-label="Search exercises">
      <select id="lib-cat" aria-label="Category"><option value="">All categories</option>${Object.entries(CATEGORIES)
        .map(([k, v]) => `<option value="${k}" ${k === filter.category ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
    </div>
    <details class="card add-panel">
      <summary>Add custom exercise</summary>
      <form id="ex-form" class="form">
        <div class="form-grid">
          <label class="field"><span>Name</span><input type="text" name="name" required></label>
          <label class="field"><span>Category</span><select name="category">${Object.entries(CATEGORIES)
            .filter(([k]) => k !== 'assessment').map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></label>
          <label class="field"><span>Difficulty (1–5)</span><input type="number" name="difficulty" min="1" max="5" value="3"></label>
          <label class="field"><span>Subdivision</span><select name="subdivision">${SUBDIVISIONS.map((s) => `<option>${esc(s)}</option>`).join('')}</select></label>
          <label class="field"><span>BPM from</span><input type="number" name="bpmMin" min="20" max="400" inputmode="numeric"></label>
          <label class="field"><span>BPM to</span><input type="number" name="bpmMax" min="20" max="400" inputmode="numeric"></label>
          <label class="field"><span>Suggested duration (min)</span><input type="number" name="durationMin" min="1" max="120" value="5"></label>
          <label class="check-line"><input type="checkbox" name="isBenchmark"> Track as a BPM benchmark</label>
        </div>
        <label class="field"><span>Description & instructions</span><textarea name="instructions" rows="3"></textarea></label>
        <div class="actions"><button class="btn" type="submit">Add exercise</button></div>
      </form>
    </details>
    ${groups || '<p class="muted">No exercises match.</p>'}`;

  /** @param {HTMLElement} root */
  const mount = (root) => {
    const q = /** @type {HTMLInputElement} */ (root.querySelector('#lib-q'));
    q.addEventListener('change', () => {
      filter.q = q.value;
      ctx.go(location.hash);
    });
    const cat = /** @type {HTMLSelectElement} */ (root.querySelector('#lib-cat'));
    cat.addEventListener('change', () => {
      filter.category = cat.value;
      ctx.go(location.hash);
    });

    root.querySelectorAll('textarea[data-note]').forEach((el) => {
      const ta = /** @type {HTMLTextAreaElement} */ (el);
      ta.addEventListener('change', () => {
        const id = ta.dataset.note ?? '';
        ctx.store.update((st) => {
          if (ta.value.trim()) st.exerciseNotes[id] = ta.value.trim();
          else delete st.exerciseNotes[id];
        }, { silent: true });
      });
    });

    const form = /** @type {HTMLFormElement} */ (root.querySelector('#ex-form'));
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const str = (/** @type {string} */ k) => String(fd.get(k) ?? '').trim();
      const min = Number(str('bpmMin')), max = Number(str('bpmMax'));
      ctx.store.update((st) => {
        st.customExercises.push({
          id: `custom-${uid()}`,
          name: str('name'),
          category: str('category'),
          difficulty: Math.min(5, Math.max(1, Number(str('difficulty')) || 3)),
          format: 'timed',
          instructions: str('instructions'),
          targetBpm: min || max ? { min: min || max, max: max || min } : null,
          subdivision: str('subdivision'),
          durationMin: Number(str('durationMin')) || 5,
          isBenchmark: fd.get('isBenchmark') === 'on',
          custom: true,
        });
      });
    });
  };

  return { html, mount };
}
