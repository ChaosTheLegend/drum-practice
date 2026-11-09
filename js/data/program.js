// @ts-check
// The 14-day intermediate program. Days are not tied to dates: the schedule
// maps them onto the training dates the user configures in Settings.

/** @type {import('../models.js').TrainingProgram} */
export const INTERMEDIATE_14 = {
  id: 'intermediate-14',
  name: '14-Day Intermediate Program',
  description: 'Hands, single-pedal kick, independence, linear playing, metal grooves and endurance — with clean technique ahead of raw tempo.',
  difficulty: 'Intermediate',
  days: [
    {
      id: 'd1', dayNumber: 1, title: 'Foundations', focus: 'Hands & time',
      instructions: 'Establish your reference tempos. Everything today is about relaxed, even strokes — note the BPM where tension starts.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'singles-ladder', targetBpm: { min: 90, max: 130 } },
        { exerciseId: 'doubles', targetBpm: { min: 70, max: 100 } },
        { exerciseId: 'kick-endurance', sets: 3, targetBpm: { min: 80, max: 110 } },
        { exerciseId: 'song', note: 'Pick the song you will use for the final assessment and start mapping its sections.' },
      ],
      challenge: 'Play 60 s of singles at your clean tempo with your eyes closed — no drift against the click.',
    },
    {
      id: 'd2', dayNumber: 2, title: 'Rudiments & kick', focus: 'Accent control, single-pedal endurance',
      instructions: 'Rudiments with dynamics, then build kick stamina with strict rest intervals.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'paradiddles' },
        { exerciseId: 'accent-taps' },
        { exerciseId: 'kick-endurance', sets: 4 },
        { exerciseId: 'gallop', targetBpm: { min: 80, max: 110 } },
      ],
      challenge: 'Paradiddles with accents on the toms and taps as ghost notes, 2 minutes non-stop.',
    },
    {
      id: 'd3', dayNumber: 3, title: 'Independence I', focus: 'Limb independence & coordination',
      instructions: 'Slow and accurate. If a limb stumbles, halve the tempo rather than pushing through.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'hat-ostinato' },
        { exerciseId: 'left-foot' },
        { exerciseId: 'paradiddle-kit' },
        { exerciseId: 'improv', note: 'Improvise using only ideas from today’s independence patterns.' },
      ],
      challenge: 'Keep the left-foot quarters going while you improvise on the hands for a full minute.',
    },
    {
      id: 'd4', dayNumber: 4, title: 'Linear I', focus: 'Linear grooves & fills',
      instructions: 'Linear playing exposes uneven voices. Balance kick, snare and hat before adding speed.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'linear-basic' },
        { exerciseId: 'linear-fills', targetBpm: { min: 55, max: 80 } },
        { exerciseId: 'doubles' },
        { exerciseId: 'song' },
      ],
      challenge: 'Use a linear fill as the transition into the chorus of your song.',
    },
    {
      id: 'd5', dayNumber: 5, title: 'Metal grooves', focus: 'Thrash beat, gallops, fills',
      instructions: 'Groove first, speed second. Record a short clip of the thrash beat to check snare consistency.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'thrash-beat', targetBpm: { min: 130, max: 170 } },
        { exerciseId: 'gallop' },
        { exerciseId: 'kick-doubles', targetBpm: { min: 70, max: 100 } },
        { exerciseId: 'metal-fills' },
      ],
      challenge: 'Four bars thrash beat → one-bar fill → four bars gallop, without the tempo moving.',
    },
    {
      id: 'd6', dayNumber: 6, title: 'Endurance', focus: 'Stamina at controlled tempos',
      instructions: 'Long, steady playing. The goal is to finish as cleanly as you started.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'singles-ladder' },
        { exerciseId: 'endurance-groove' },
        { exerciseId: 'kick-endurance', sets: 5 },
        { exerciseId: 'record-review', note: 'Record the second endurance-groove set.' },
      ],
      challenge: 'Play the endurance groove for 7 minutes instead of 5.',
    },
    {
      id: 'd7', dayNumber: 7, title: 'Midpoint check', focus: 'Benchmarks & review',
      instructions: 'Measure where you are halfway through. Log each benchmark on the Progress page — both max and sustainable speed.',
      items: [
        { exerciseId: 'warmup-singles', durationMin: 8 },
        { exerciseId: 'assess-bpm', note: 'Mid-program measurement — log results under Progress.' },
        { exerciseId: 'song', note: 'Full run-through of your song.' },
        { exerciseId: 'improv' },
      ],
      challenge: 'Compare today’s clean BPM with your baseline and write one sentence about what changed.',
    },
    {
      id: 'd8', dayNumber: 8, title: 'Speed with control', focus: 'Pushing tempo cleanly',
      instructions: 'Short, focused speed bursts with full recovery. Never log a "clean" result that wasn’t clean.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'singles-ladder', targetBpm: { min: 110, max: 160 } },
        { exerciseId: 'doubles', targetBpm: { min: 90, max: 130 } },
        { exerciseId: 'six-stroke' },
        { exerciseId: 'kick-doubles' },
      ],
      challenge: 'Sixteenth singles 10 BPM above your sustainable speed for 15 s, then drop back down and stay relaxed.',
    },
    {
      id: 'd9', dayNumber: 9, title: 'Independence II', focus: 'Coordination under load',
      instructions: 'Combine independence and linear ideas at moderately higher tempos.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'hat-ostinato', targetBpm: { min: 90, max: 120 } },
        { exerciseId: 'paradiddle-kit', targetBpm: { min: 85, max: 110 } },
        { exerciseId: 'linear-basic', targetBpm: { min: 85, max: 110 } },
        { exerciseId: 'left-foot' },
      ],
      challenge: 'Play a paradiddle groove with left-foot hi-hat on the "&"s for 2 minutes.',
    },
    {
      id: 'd10', dayNumber: 10, title: 'Fills & phrasing', focus: 'Musical fills and transitions',
      instructions: 'Think in phrases: where the fill starts, how it builds, how it lands.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'flam-accents' },
        { exerciseId: 'metal-fills' },
        { exerciseId: 'linear-fills' },
        { exerciseId: 'improv', note: 'Trade 4s with yourself: 4 bars groove, 4 bars fill.' },
      ],
      challenge: 'Write (or memorise) one signature fill and use it in your song.',
    },
    {
      id: 'd11', dayNumber: 11, title: 'Thrash endurance', focus: 'Fast grooves over time',
      instructions: 'Hold fast grooves at a sustainable tempo — not your maximum.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'thrash-beat' },
        { exerciseId: 'endurance-groove', note: 'Use the thrash beat or gallop as the groove.' },
        { exerciseId: 'kick-endurance', subdivision: 'sixteenths', note: 'Sixteenths at a lower tempo.' },
        { exerciseId: 'song' },
      ],
      challenge: 'Thrash beat for 3 minutes straight at 90 % of your clean max.',
    },
    {
      id: 'd12', dayNumber: 12, title: 'Musicality', focus: 'Dynamics, feel, listening',
      instructions: 'No speed work today. Make it sound good.',
      items: [
        { exerciseId: 'slow-control' },
        { exerciseId: 'accent-taps' },
        { exerciseId: 'song', note: 'Focus on dynamics and feel, not tempo.' },
        { exerciseId: 'improv', durationMin: 10 },
        { exerciseId: 'record-review' },
      ],
      challenge: 'Play your song at 80 % volume with the same energy.',
    },
    {
      id: 'd13', dayNumber: 13, title: 'Consolidation', focus: 'Weak spots & taper',
      instructions: 'Lighter session before the final assessment. Fix what your log says needs work, then rest your hands.',
      items: [
        { exerciseId: 'warmup-singles' },
        { exerciseId: 'free-practice' },
        { exerciseId: 'song', note: 'One relaxed full run-through.' },
      ],
      challenge: 'Stop while it still feels good.',
    },
    {
      id: 'd14', dayNumber: 14, title: 'Final assessment', focus: 'Repeat the baseline under the same conditions',
      instructions: 'Same song, same kit settings, same recording setup as the baseline. Warm up properly first. Enter the results on the Assess page to compare.',
      isAssessment: true,
      items: [
        { exerciseId: 'warmup-singles', durationMin: 10 },
        { exerciseId: 'assess-bpm' },
        { exerciseId: 'assess-song' },
        { exerciseId: 'assess-improv' },
      ],
    },
  ],
};

/**
 * Generated filler day used when the configured date range has more training
 * days than the program contains.
 * @param {number} n
 * @returns {import('../models.js').TrainingDay}
 */
export function makeExtraDay(n) {
  return {
    id: `extra-${n}`,
    dayNumber: 0,
    title: 'Review & consolidation',
    focus: 'Weak spots, repertoire, free playing',
    instructions: 'An extra day in your schedule. Revisit what your log flags as needing work, keep the song in your hands, and play freely.',
    items: [
      { exerciseId: 'warmup-singles' },
      { exerciseId: 'free-practice' },
      { exerciseId: 'song' },
      { exerciseId: 'improv' },
    ],
    challenge: 'Pick the exercise you enjoy least and give it 5 extra minutes.',
  };
}

export const PROGRAMS = { [INTERMEDIATE_14.id]: INTERMEDIATE_14 };
