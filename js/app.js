// @ts-check
// App entry: wires the store, router, global actions and the session timer.
import { EXERCISES } from './data/exercises.js';
import { PROGRAMS } from './data/program.js';
import { buildSchedule, isDayComplete, todayIso } from './schedule.js';
import { LocalStorageAdapter, Store } from './storage.js';
import { assessView } from './views/assess.js';
import { dashboardView } from './views/dashboard.js';
import { libraryView } from './views/library.js';
import { logView } from './views/log.js';
import { dayView, programView } from './views/program.js';
import { progressView } from './views/progress.js';
import { settingsView } from './views/settings.js';
import { statsView } from './views/stats.js';

const store = new Store(new LocalStorageAdapter());

/** @type {Record<string, (ctx: import('./models.js').ViewContext) => import('./models.js').ViewResult>} */
const ROUTES = {
  '': dashboardView,
  program: programView,
  day: dayView,
  log: logView,
  progress: progressView,
  assess: assessView,
  library: libraryView,
  stats: statsView,
  settings: settingsView,
};

const view = /** @type {HTMLElement} */ (document.getElementById('view'));
const timerBar = /** @type {HTMLElement} */ (document.getElementById('timer'));

/** @returns {import('./models.js').Route} */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] ?? '', args: parts.slice(1), query: new URLSearchParams(query) };
}

/** @param {string} hash */
function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

/** @returns {import('./models.js').ViewContext} */
function buildContext() {
  const state = store.state;
  const program = PROGRAMS[state.programId] ?? Object.values(PROGRAMS)[0];
  const lib = new Map([...EXERCISES, ...state.customExercises].map((e) => [e.id, e]));
  return { state, store, program, lib, schedule: buildSchedule(program, state.settings), today: todayIso(), route: parseHash(), go };
}

function render() {
  const ctx = buildContext();
  const viewFn = ROUTES[ctx.route.name] ?? dashboardView;
  const { html, mount } = viewFn(ctx);
  view.innerHTML = html;
  mount?.(view);
  document.querySelectorAll('.nav a').forEach((a) => {
    const target = (a.getAttribute('href') ?? '').replace(/^#\/?/, '');
    const active = target === ctx.route.name || (target === 'program' && ctx.route.name === 'day');
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  renderTimer();
}

// ---------- Session timer ----------
function renderTimer() {
  const active = store.state.activeSession;
  timerBar.hidden = !active;
  if (!active) return;
  const secs = Math.max(0, Math.floor((Date.now() - active.startedAt) / 1000));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const clock = `${h ? `${h}:` : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(s).padStart(2, '0')}`;
  const label = timerBar.querySelector('.timer-clock');
  if (label) label.textContent = clock;
}
setInterval(renderTimer, 1000);

// ---------- Global actions (event delegation) ----------
document.addEventListener('click', (ev) => {
  const el = /** @type {HTMLElement|null} */ (/** @type {HTMLElement} */ (ev.target).closest('[data-action]'));
  if (!el) return;
  const { action, day, idx, id } = el.dataset;
  const ctx = buildContext();

  switch (action) {
    case 'toggle-item':
      if (!day || idx === undefined) return;
      store.update((s) => {
        const p = (s.dayProgress[day] ??= { done: {}, manual: false });
        p.done[idx] = !p.done[idx];
        if (!p.done[idx]) p.manual = false;
      });
      break;
    case 'toggle-complete': {
      const d = ctx.schedule.training.find((e) => e.day?.id === day)?.day ?? ctx.program.days.find((x) => x.id === day);
      if (!d || !day) return;
      const complete = isDayComplete(store.state, d);
      store.update((s) => {
        s.dayProgress[day] = complete ? { done: {}, manual: false } : { ...(s.dayProgress[day] ?? { done: {} }), manual: true };
      });
      break;
    }
    case 'start-session':
      store.update((s) => (s.activeSession = { dayId: day ?? '', startedAt: Date.now() }));
      break;
    case 'finish-session': {
      const active = store.state.activeSession;
      if (!active) return;
      const minutes = Math.max(1, Math.round((Date.now() - active.startedAt) / 60000));
      store.update((s) => (s.activeSession = null), { silent: true });
      go(`#/log/new?day=${encodeURIComponent(active.dayId)}&min=${minutes}`);
      break;
    }
    case 'cancel-session':
      if (confirm('Discard the running session timer?')) store.update((s) => (s.activeSession = null));
      break;
    case 'delete-benchmark':
      if (id && confirm('Delete this measurement?')) store.update((s) => (s.benchmarks = s.benchmarks.filter((b) => b.id !== id)));
      break;
    case 'delete-exercise':
      if (id && confirm('Delete this custom exercise? Logged measurements for it are kept.')) {
        store.update((s) => (s.customExercises = s.customExercises.filter((e) => e.id !== id)));
      }
      break;
  }
});

store.subscribe(render);
window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

await store.init();
render();
