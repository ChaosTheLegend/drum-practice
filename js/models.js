// @ts-check
// Type definitions shared across the app (JSDoc, checked by the editor via // @ts-check).

/**
 * @typedef {'timed'|'reps'|'bpm-progression'|'free'|'song'|'assessment'} ExerciseFormat
 * @typedef {{min:number, max:number}} BpmRange
 *
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string} category        key of CATEGORIES
 * @property {number} difficulty      1–5
 * @property {ExerciseFormat} format
 * @property {string} instructions
 * @property {BpmRange|null} targetBpm
 * @property {string} subdivision
 * @property {number} durationMin
 * @property {number} [sets]
 * @property {number} [reps]
 * @property {boolean} [isBenchmark]  offered as a benchmark / assessment measurement
 * @property {boolean} [custom]       user-created
 *
 * @typedef {Object} DayItem          an exercise as used on a given day (overrides library defaults)
 * @property {string} exerciseId
 * @property {number} [durationMin]
 * @property {BpmRange} [targetBpm]
 * @property {string} [subdivision]
 * @property {number} [sets]
 * @property {number} [reps]
 * @property {string} [note]
 *
 * @typedef {Object} TrainingDay
 * @property {string} id
 * @property {number} dayNumber
 * @property {string} title
 * @property {string} focus
 * @property {string} instructions
 * @property {DayItem[]} items
 * @property {string} [challenge]
 * @property {boolean} [isAssessment]
 *
 * @typedef {Object} TrainingProgram
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} difficulty
 * @property {TrainingDay[]} days     the last day is the final assessment
 *
 * @typedef {Object} ScheduleEntry
 * @property {string} date            YYYY-MM-DD
 * @property {boolean} isRest
 * @property {string} [restLabel]
 * @property {TrainingDay|null} day
 * @property {number} slot            1-based training-day number (0 for rest days)
 *
 * @typedef {Object} Schedule
 * @property {boolean} configured
 * @property {ScheduleEntry[]} entries
 * @property {ScheduleEntry[]} training
 * @property {string[]} warnings
 *
 * @typedef {Object} Settings
 * @property {string} startDate
 * @property {string} endDate
 * @property {number[]} restWeekdays   0 = Sunday … 6 = Saturday
 * @property {Record<string,string>} restDates  date -> optional label
 *
 * @typedef {Object} DayProgress
 * @property {Record<string,boolean>} done   item index -> checked
 * @property {boolean} manual                marked complete by hand
 *
 * @typedef {Object} PracticeSession
 * @property {string} id
 * @property {string} date
 * @property {string} trainingDayId    '' = free practice outside the program
 * @property {number} durationMin
 * @property {number} difficulty       1–10
 * @property {string} achievedBpm
 * @property {number[]} completedExercises  item indices of the training day
 * @property {string} notes
 * @property {string} wentWell
 * @property {string} improve
 * @property {string} nextFocus
 *
 * @typedef {Object} TechnicalBenchmark
 * @property {string} id
 * @property {string} exerciseId
 * @property {string} date
 * @property {number} bpm
 * @property {string} subdivision
 * @property {'max'|'sustained'} type   burst maximum vs. sustainable speed
 * @property {string} duration          e.g. "60 s" or "4 × 16"
 * @property {boolean} isClean
 * @property {string} notes
 *
 * @typedef {Object} AssessmentBenchmark
 * @property {string} exerciseId
 * @property {number|null} max
 * @property {number|null} clean
 * @property {string} subdivision
 *
 * @typedef {Object} Assessment
 * @property {string} date
 * @property {string} song
 * @property {string} songRecording
 * @property {string} improvisationRecording
 * @property {number|null} songDifficulty  1–10
 * @property {AssessmentBenchmark[]} benchmarks
 * @property {{endurance:string, coordination:string, consistency:string, musicality:string}} observations
 * @property {string} strengths
 * @property {string} weaknesses
 * @property {string} notes
 *
 * @typedef {Object} AppState
 * @property {number} version
 * @property {Settings} settings
 * @property {string} programId
 * @property {Record<string, DayProgress>} dayProgress
 * @property {PracticeSession[]} sessions
 * @property {TechnicalBenchmark[]} benchmarks
 * @property {{baseline: Assessment|null, final: Assessment|null}} assessments
 * @property {Exercise[]} customExercises
 * @property {Record<string,string>} exerciseNotes
 * @property {{dayId:string, startedAt:number}|null} activeSession
 *
 * @typedef {Object} Route
 * @property {string} name
 * @property {string[]} args
 * @property {URLSearchParams} query
 *
 * @typedef {Object} ViewContext
 * @property {AppState} state
 * @property {import('./storage.js').Store} store
 * @property {TrainingProgram} program
 * @property {Map<string, Exercise>} lib
 * @property {Schedule} schedule
 * @property {string} today
 * @property {Route} route
 * @property {(hash: string) => void} go
 *
 * @typedef {{html: string, mount?: (root: HTMLElement) => void}} ViewResult
 */

export {};
