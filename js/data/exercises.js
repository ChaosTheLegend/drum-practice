// @ts-check
// Built-in exercise library. Pure data — no application logic here.

/** @type {Record<string,string>} */
export const CATEGORIES = {
  hands: 'Hands & rudiments',
  feet: 'Kick & feet',
  independence: 'Independence',
  linear: 'Linear',
  grooves: 'Grooves',
  fills: 'Fills',
  endurance: 'Endurance',
  musicality: 'Musicality',
  assessment: 'Assessment',
};

export const SUBDIVISIONS = [
  'quarters', 'eighths', 'eighth triplets', 'sixteenths', 'sixteenth triplets', 'sextuplets', '32nds', 'mixed',
];

/** Exercises measured in the baseline / final assessment. */
export const ASSESSMENT_BENCHMARKS = ['singles-ladder', 'doubles', 'paradiddles', 'kick-endurance', 'thrash-beat'];

/** @type {import('../models.js').Exercise[]} */
export const EXERCISES = [
  {
    id: 'warmup-singles', name: 'Single-stroke warm-up', category: 'hands', difficulty: 1, format: 'timed',
    subdivision: 'sixteenths', targetBpm: { min: 70, max: 90 }, durationMin: 5,
    instructions: 'Alternate R L R L on the snare or a pad. Start with eighths, move to sixteenths after a minute. Loose grip, rebound-driven strokes, both sticks at equal heights. Stop and shake out if the forearms tense up.',
  },
  {
    id: 'singles-ladder', name: 'Single-stroke roll', category: 'hands', difficulty: 3, format: 'bpm-progression',
    subdivision: 'sixteenths', targetBpm: { min: 100, max: 150 }, durationMin: 10, isBenchmark: true,
    instructions: 'BPM ladder: play 60 s of continuous singles. If it was clean and relaxed, raise the click by 4 BPM; if not, drop 8 BPM and repeat. The highest tempo held cleanly for the full minute is your sustainable speed — not the fastest burst.',
  },
  {
    id: 'doubles', name: 'Double-stroke roll', category: 'hands', difficulty: 3, format: 'bpm-progression',
    subdivision: 'sixteenths', targetBpm: { min: 80, max: 120 }, durationMin: 8, isBenchmark: true,
    instructions: 'RR LL. Make the second stroke of each pair as loud as the first — drive it with the fingers, not a dead bounce. Alternate 30 s slow with exaggerated wrists and 30 s at target tempo.',
  },
  {
    id: 'paradiddles', name: 'Paradiddles', category: 'hands', difficulty: 2, format: 'bpm-progression',
    subdivision: 'sixteenths', targetBpm: { min: 80, max: 120 }, durationMin: 8, isBenchmark: true,
    instructions: 'RLRR LRLL with an accent on the first note of each group. Taps stay low (2–3 cm), accents high. Then move the accents to the floor tom while taps stay on the snare.',
  },
  {
    id: 'accent-taps', name: 'Accent / tap control', category: 'hands', difficulty: 2, format: 'timed',
    subdivision: 'sixteenths', targetBpm: { min: 90, max: 120 }, durationMin: 6,
    instructions: 'Eight-on-a-hand with a moving accent: accent beat 1, then the "e", the "&", the "a". Use down / up / tap / full strokes — no tension moving from loud to soft.',
  },
  {
    id: 'six-stroke', name: 'Six-stroke roll', category: 'hands', difficulty: 3, format: 'bpm-progression',
    subdivision: 'sextuplets', targetBpm: { min: 60, max: 90 }, durationMin: 6,
    instructions: 'R LL RR L — accent the first and last singles. Practise as a sextuplet on the snare, then as a fill: doubles on the snare, singles on the toms, crash on 1.',
  },
  {
    id: 'flam-accents', name: 'Flam accents', category: 'hands', difficulty: 3, format: 'reps',
    subdivision: 'eighth triplets', targetBpm: { min: 70, max: 100 }, durationMin: 6, sets: 4, reps: 16,
    instructions: 'Flam-tap-tap, alternating. Grace note 2 cm high, primary full height — a clear "flam", not a flat double. Later, move the flams onto the toms.',
  },
  {
    id: 'slow-control', name: 'Slow-tempo control', category: 'hands', difficulty: 2, format: 'timed',
    subdivision: 'eighths', targetBpm: { min: 50, max: 60 }, durationMin: 5,
    instructions: 'Singles and doubles at a very slow tempo, full strokes, perfectly even heights. Slow is harder than fast — every unevenness is audible.',
  },
  {
    id: 'kick-endurance', name: 'Kick speed & endurance', category: 'feet', difficulty: 3, format: 'reps',
    subdivision: 'eighths', targetBpm: { min: 90, max: 140 }, durationMin: 8, sets: 5, isBenchmark: true,
    instructions: 'Single pedal. Steady eighths on the kick with quarter notes on the hi-hat: 60 s on, 30 s off. Heel up, balance ankle and thigh. When eighths are easy, switch to sixteenths at a lower tempo. Fatigue is fine, sharp shin pain is not — stop.',
  },
  {
    id: 'kick-doubles', name: 'Kick doubles (heel-toe / slide)', category: 'feet', difficulty: 4, format: 'bpm-progression',
    subdivision: 'sixteenths', targetBpm: { min: 80, max: 130 }, durationMin: 8,
    instructions: 'Two fast kicks from one leg motion, using heel-toe or slide technique. Practise "K K – –" bursts against a hi-hat groove. Both notes should hit the same level on the module.',
  },
  {
    id: 'hat-ostinato', name: 'Hi-hat ostinato + kick variations', category: 'independence', difficulty: 2, format: 'timed',
    subdivision: 'eighths', targetBpm: { min: 70, max: 100 }, durationMin: 8,
    instructions: 'Eighths on the hi-hat, backbeat on 2 & 4. Cycle kick patterns: 1 & 3, the "&" of 2, every "&", syncopated sixteenths. The hat must never stumble when the kick moves.',
  },
  {
    id: 'left-foot', name: 'Left-foot hi-hat ostinato', category: 'independence', difficulty: 3, format: 'timed',
    subdivision: 'quarters', targetBpm: { min: 70, max: 100 }, durationMin: 6,
    instructions: 'Hi-hat pedal on quarters (later on the "&"s) while the hands play a ride groove and the kick plays simple patterns. Start slow; the foot must stay perfectly in time.',
  },
  {
    id: 'paradiddle-kit', name: 'Paradiddle grooves on the kit', category: 'independence', difficulty: 3, format: 'timed',
    subdivision: 'sixteenths', targetBpm: { min: 70, max: 100 }, durationMin: 8,
    instructions: 'Right hand on ride/hat, left hand on snare following a paradiddle sticking, kick doubling the right hand on beats 1 and 3. Then orchestrate the accents to toms and crash.',
  },
  {
    id: 'linear-basic', name: 'Linear patterns', category: 'linear', difficulty: 3, format: 'timed',
    subdivision: 'sixteenths', targetBpm: { min: 70, max: 100 }, durationMin: 8,
    instructions: 'No two limbs strike together. Cycle R L K, R L L K, R K L K as grooves (R on hat, L on snare). Keep all voices balanced — the kick must not disappear.',
  },
  {
    id: 'linear-fills', name: 'Linear fills (6-note groupings)', category: 'linear', difficulty: 4, format: 'timed',
    subdivision: 'sextuplets', targetBpm: { min: 60, max: 90 }, durationMin: 8,
    instructions: 'R L R L K K around the toms. One bar groove, one bar fill, land on a crash with the kick. Then play the groupings as sixteenths for over-the-bar-line phrasing.',
  },
  {
    id: 'thrash-beat', name: 'Thrash / skank beat', category: 'grooves', difficulty: 3, format: 'bpm-progression',
    subdivision: 'eighths', targetBpm: { min: 140, max: 190 }, durationMin: 8, isBenchmark: true,
    instructions: 'Kick on every downbeat eighth, snare on every upbeat, hand on hat/ride/crash. Hold 30 s clean, then raise 5 BPM. Keep the snare hand relaxed — tension kills thrash endurance.',
  },
  {
    id: 'gallop', name: 'Gallop & metal groove variations', category: 'grooves', difficulty: 3, format: 'timed',
    subdivision: 'sixteenths', targetBpm: { min: 90, max: 140 }, durationMin: 8,
    instructions: 'Single-foot gallop: kick on 1-e-& (K KK). Combine with a half-time snare on 3 and crash quarters. Then alternate a bar of gallop with a bar of straight sixteenth kicks at a lower tempo.',
  },
  {
    id: 'metal-fills', name: 'Metal fills & crash landings', category: 'fills', difficulty: 3, format: 'timed',
    subdivision: 'sixteenths', targetBpm: { min: 100, max: 150 }, durationMin: 8,
    instructions: 'Three bars groove, one bar fill: sixteenth tom runs, flams on the floor tom, kick-filled triplets. Always land on 1 with crash + kick — the landing matters more than the fill.',
  },
  {
    id: 'endurance-groove', name: 'Endurance groove', category: 'endurance', difficulty: 3, format: 'timed',
    subdivision: 'eighths', targetBpm: { min: 120, max: 160 }, durationMin: 12, sets: 2,
    instructions: 'Pick one groove at a comfortable tempo and play it non-stop for 5 minutes without speeding up or losing dynamics. Rest 2 minutes, repeat. Note when and where fatigue shows up.',
  },
  {
    id: 'improv', name: 'Free improvisation', category: 'musicality', difficulty: 2, format: 'free',
    subdivision: 'mixed', targetBpm: null, durationMin: 5,
    instructions: 'No click, or a slow one. Play musical phrases: question and answer, dynamics from ghost notes to full volume, deliberate space. Tell a story rather than chaining licks.',
  },
  {
    id: 'song', name: 'Song-learning session', category: 'musicality', difficulty: 3, format: 'song',
    subdivision: 'mixed', targetBpm: null, durationMin: 15,
    instructions: 'Work on one song section by section: listen, play along slowly, then at tempo. Mark the sections that still break down and loop them.',
  },
  {
    id: 'record-review', name: 'Record & review', category: 'musicality', difficulty: 2, format: 'assessment',
    subdivision: 'mixed', targetBpm: null, durationMin: 10,
    instructions: 'Record one take (song or groove). Listen back without playing. Note timing drift, uneven volume, rushed fills. Write down one thing to keep and one thing to fix.',
  },
  {
    id: 'free-practice', name: 'Weak-spot practice', category: 'musicality', difficulty: 2, format: 'free',
    subdivision: 'mixed', targetBpm: null, durationMin: 15,
    instructions: 'Revisit what recent log entries flagged under "needs improvement". Slow it down, isolate the problem, then put it back in musical context.',
  },
  {
    id: 'assess-song', name: 'Assessment: full song recording', category: 'assessment', difficulty: 3, format: 'assessment',
    subdivision: 'mixed', targetBpm: null, durationMin: 10,
    instructions: 'Record a familiar but challenging song from beginning to end in one take. Use the same song, kit settings and recording setup in both assessments.',
  },
  {
    id: 'assess-improv', name: 'Assessment: 2-minute improvisation', category: 'assessment', difficulty: 2, format: 'assessment',
    subdivision: 'mixed', targetBpm: null, durationMin: 5,
    instructions: 'Record two minutes of natural improvisation with no plan. Same conditions in both assessments.',
  },
  {
    id: 'assess-bpm', name: 'Assessment: clean maximum BPM', category: 'assessment', difficulty: 3, format: 'assessment',
    subdivision: 'sixteenths', targetBpm: null, durationMin: 15,
    instructions: 'For singles, doubles, paradiddles, kick and thrash beat: find the fastest tempo you can hold for 30 s (max) and the fastest you can play cleanly and relaxed for 60 s (sustainable). Enter both on the Assess page.',
  },
];
