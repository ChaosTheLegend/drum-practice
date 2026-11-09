// @ts-check
import { addDays, diffDays, formatDate, weekday } from '../schedule.js';
import { esc } from '../ui.js';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_CALENDAR_DAYS = 180;

/** @param {import('../models.js').ViewContext} ctx @returns {import('../models.js').ViewResult} */
export function settingsView(ctx) {
  const { state, schedule, program } = ctx;
  const st = state.settings;

  let calendar = '';
  if (st.startDate && st.endDate && st.endDate >= st.startDate) {
    const span = Math.min(diffDays(st.startDate, st.endDate) + 1, MAX_CALENDAR_DAYS);
    const lead = (weekday(st.startDate) + 6) % 7; // blanks before a Monday-first grid
    const cells = [
      ...Array.from({ length: lead }, () => '<span class="cal-blank"></span>'),
      ...Array.from({ length: span }, (_, i) => {
        const d = addDays(st.startDate, i);
        const weekly = st.restWeekdays.includes(weekday(d));
        const single = d in st.restDates;
        const rest = weekly || single;
        const entry = schedule.entries.find((e) => e.date === d);
        return `<button type="button" class="cal-day ${rest ? 'is-rest' : ''} ${weekly ? 'is-weekly' : ''}" data-date="${d}" ${weekly ? 'disabled title="Weekly rest day"' : ''} aria-pressed="${rest}">
          <span class="cal-num">${esc(formatDate(d, { day: 'numeric' }))}</span>
          <span class="cal-sub">${rest ? 'rest' : entry?.slot ? `D${entry.slot}` : ''}</span></button>`;
      }),
    ].join('');
    calendar = `<div class="cal-head">${WEEKDAYS.map((w) => `<span>${WEEKDAY_NAMES[w]}</span>`).join('')}</div><div class="cal">${cells}</div>`;
  }

  const restList = Object.keys(st.restDates).sort();
  const labels = restList.length
    ? `<ul class="plain-list rest-labels">${restList
        .map((d) => `<li><span>${esc(formatDate(d))}</span><input type="text" data-rest-label="${d}" value="${esc(st.restDates[d])}" placeholder="Label (optional), e.g. concert" aria-label="Label for ${esc(formatDate(d))}"></li>`)
        .join('')}</ul>`
    : '';

  const summary = schedule.configured
    ? `<p class="notice notice-ok">${schedule.training.length} training days and ${schedule.entries.length - schedule.training.length} rest days. Final assessment on ${esc(formatDate(schedule.training.at(-1)?.date ?? ''))}.</p>`
    : '';

  const html = `<h1 class="page-title">Settings</h1>
    <section class="card">
      <h2 class="card-title">Schedule — ${esc(program.name)}</h2>
      <p class="muted">Pick the dates of your training block. Record your baseline assessment before the start date.</p>
      <div class="form-grid">
        <label class="field"><span>Start date (Day 1)</span><input type="date" id="start" value="${esc(st.startDate)}"></label>
        <label class="field"><span>End date (final assessment)</span><input type="date" id="end" value="${esc(st.endDate)}" ${st.startDate ? `min="${esc(st.startDate)}"` : ''}></label>
      </div>
      <fieldset class="field"><legend>Weekly rest days</legend><div class="weekday-picks">
        ${WEEKDAYS.map((w) => `<label class="pill"><input type="checkbox" data-weekday="${w}" ${st.restWeekdays.includes(w) ? 'checked' : ''}><span>${WEEKDAY_NAMES[w]}</span></label>`).join('')}
      </div></fieldset>
      ${schedule.warnings.map((w) => `<p class="notice">${esc(w)}</p>`).join('')}
      ${summary}
      ${calendar ? `<h3 class="sub-title">Rest days — tap a date to toggle</h3>${calendar}${labels}` : ''}
    </section>
    <section class="card">
      <h2 class="card-title">Data</h2>
      <p class="muted">Everything is stored in this browser only. Export a backup regularly, and import it to move to another device.</p>
      <div class="actions">
        <button class="btn" id="export">Export JSON</button>
        <label class="btn btn-ghost file-btn">Import JSON<input type="file" id="import" accept="application/json,.json" hidden></label>
        <button class="btn btn-ghost btn-danger" id="reset">Reset all data</button>
      </div>
    </section>`;

  /** @param {HTMLElement} root */
  const mount = (root) => {
    const $ = (/** @type {string} */ sel) => /** @type {HTMLInputElement} */ (root.querySelector(sel));
    $('#start').addEventListener('change', (ev) => {
      const v = /** @type {HTMLInputElement} */ (ev.target).value;
      ctx.store.update((s) => {
        s.settings.startDate = v;
        // Suggest a 16-day block (14 training days + 2 rest) when no end date is set yet.
        if (v && (!s.settings.endDate || s.settings.endDate < v)) s.settings.endDate = addDays(v, 15);
      });
    });
    $('#end').addEventListener('change', (ev) => {
      const v = /** @type {HTMLInputElement} */ (ev.target).value;
      ctx.store.update((s) => (s.settings.endDate = v));
    });
    root.querySelectorAll('[data-weekday]').forEach((el) =>
      el.addEventListener('change', () => {
        const w = Number(/** @type {HTMLInputElement} */ (el).dataset.weekday);
        ctx.store.update((s) => {
          const set = new Set(s.settings.restWeekdays);
          if (set.has(w)) set.delete(w);
          else set.add(w);
          s.settings.restWeekdays = [...set];
        });
      }),
    );
    root.querySelectorAll('.cal-day[data-date]').forEach((el) =>
      el.addEventListener('click', () => {
        const d = /** @type {HTMLElement} */ (el).dataset.date ?? '';
        ctx.store.update((s) => {
          if (d in s.settings.restDates) delete s.settings.restDates[d];
          else s.settings.restDates[d] = '';
        });
      }),
    );
    root.querySelectorAll('[data-rest-label]').forEach((el) => {
      const input = /** @type {HTMLInputElement} */ (el);
      input.addEventListener('change', () =>
        ctx.store.update((s) => (s.settings.restDates[input.dataset.restLabel ?? ''] = input.value.trim()), { silent: true }),
      );
    });

    $('#export').addEventListener('click', () => {
      const blob = new Blob([ctx.store.exportJson()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `drum-practice-${ctx.today}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#import').addEventListener('change', async (ev) => {
      const file = /** @type {HTMLInputElement} */ (ev.target).files?.[0];
      if (!file) return;
      if (!confirm('Replace all current data with this backup?')) return;
      try {
        ctx.store.importJson(await file.text());
        alert('Backup imported.');
      } catch (err) {
        alert(`Import failed: ${err instanceof Error ? err.message : err}`);
      }
    });
    $('#reset').addEventListener('click', () => {
      if (confirm('Delete all sessions, measurements, assessments and settings? Export a backup first if unsure.')) ctx.store.reset();
    });
  };

  return { html, mount };
}
