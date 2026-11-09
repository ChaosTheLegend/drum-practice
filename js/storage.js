// @ts-check
// Data layer. The app talks only to `Store`; persistence goes through an
// adapter with async load/save, so localStorage can later be swapped for a
// backend (with auth + sync) without touching views.

export const STORAGE_KEY = 'drum-practice:v1';
export const STATE_VERSION = 1;

/** @returns {import('./models.js').AppState} */
export function createEmptyState() {
  return {
    version: STATE_VERSION,
    settings: { startDate: '', endDate: '', restWeekdays: [], restDates: {} },
    programId: 'intermediate-14',
    dayProgress: {},
    sessions: [],
    benchmarks: [],
    assessments: { baseline: null, final: null },
    customExercises: [],
    exerciseNotes: {},
    activeSession: null,
  };
}

/**
 * Normalise anything loaded or imported into a complete AppState.
 * @param {any} raw
 * @returns {import('./models.js').AppState}
 */
export function migrate(raw) {
  const base = createEmptyState();
  if (!raw || typeof raw !== 'object') return base;
  const arr = (/** @type {any} */ v) => (Array.isArray(v) ? v : []);
  const obj = (/** @type {any} */ v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  return {
    ...base,
    ...raw,
    version: STATE_VERSION,
    settings: {
      ...base.settings,
      ...obj(raw.settings),
      restWeekdays: arr(raw.settings?.restWeekdays),
      restDates: obj(raw.settings?.restDates),
    },
    dayProgress: obj(raw.dayProgress),
    sessions: arr(raw.sessions),
    benchmarks: arr(raw.benchmarks),
    assessments: { ...base.assessments, ...obj(raw.assessments) },
    customExercises: arr(raw.customExercises),
    exerciseNotes: obj(raw.exerciseNotes),
    activeSession: raw.activeSession ?? null,
  };
}

/**
 * @typedef {Object} StorageAdapter
 * @property {() => Promise<any>} load
 * @property {(state: import('./models.js').AppState) => Promise<void>} save
 */

/** @implements {StorageAdapter} */
export class LocalStorageAdapter {
  constructor(key = STORAGE_KEY) {
    this.key = key;
  }
  async load() {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : null;
  }
  /** @param {import('./models.js').AppState} state */
  async save(state) {
    localStorage.setItem(this.key, JSON.stringify(state));
  }
}

export class Store {
  /** @param {StorageAdapter} adapter */
  constructor(adapter) {
    this.adapter = adapter;
    this.state = createEmptyState();
    /** @type {Set<(s: import('./models.js').AppState) => void>} */
    this.listeners = new Set();
  }

  async init() {
    try {
      this.state = migrate(await this.adapter.load());
    } catch (err) {
      console.error('Could not load saved data', err);
    }
  }

  /**
   * Mutate state, persist, and notify listeners.
   * @param {(s: import('./models.js').AppState) => void} mutator
   * @param {{silent?: boolean}} [opts] silent: persist without re-rendering
   */
  update(mutator, opts = {}) {
    mutator(this.state);
    this.adapter.save(this.state).catch((err) => console.error('Could not save data', err));
    if (!opts.silent) this.listeners.forEach((fn) => fn(this.state));
  }

  /** @param {(s: import('./models.js').AppState) => void} fn */
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  exportJson() {
    return JSON.stringify({ app: 'drum-practice', exportedAt: new Date().toISOString(), data: this.state }, null, 2);
  }

  /** @param {string} text */
  importJson(text) {
    const parsed = JSON.parse(text);
    const data = parsed && parsed.app === 'drum-practice' ? parsed.data : parsed;
    if (!data || typeof data !== 'object' || !('settings' in data || 'sessions' in data)) {
      throw new Error('This file does not look like a Drum Practice backup.');
    }
    this.update((s) => Object.assign(s, migrate(data)));
  }

  reset() {
    this.update((s) => Object.assign(s, createEmptyState()));
  }
}
