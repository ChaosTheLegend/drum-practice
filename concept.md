# Drum Practice Tracker — Development Brief

## 1. Project Overview

Develop a lightweight, responsive web application for tracking drum practice, managing training programs, and monitoring technical progress over time.

The application is primarily intended for personal use. It will be hosted on a personal domain and should work well on desktop, tablets, and mobile devices.

The initial version will support a structured 14-day intermediate drumming program, with the architecture allowing additional training programs and exercises to be added later.

The application should feel like a practical training dashboard rather than a generic habit tracker.

## 2. User Profile and Training Goals

The application is designed around an intermediate amateur drummer with approximately two years of experience.

**Equipment:**
- Electronic drum kit.
- Single-pedal setup (exercises should not require a double pedal).

**Musical preferences:**
- Rock
- Alternative
- Metal
- Thrash metal

**Primary development goals:**
- Hand speed and rudiment proficiency.
- Kick speed and endurance.
- Limb independence and coordination.
- Metal grooves and fills.
- Linear drumming.
- Playing endurance.
- Musical expression and improvisation.

The application should emphasize gradual progression, clean technique, consistency, and musicality rather than raw BPM numbers.

## 3. Main Features

### 3.1 Training Dashboard

The main screen should provide an overview of the current training program.

Display:
- Current training day and date.
- Overall program progress.
- Today's exercises.
- Estimated session duration.
- Completion status.
- Upcoming rest days.
- Quick access to practice logs and progress records.

A clear progress indicator should show how much of the current program has been completed.

### 3.2 Training Program

Support structured training programs consisting of individual days and exercises.

Each training day should contain:
- Day number and date.
- Training focus.
- Exercise list.
- Instructions.
- Recommended duration.
- Target BPM or BPM range, where applicable.
- Sets and repetitions.
- Additional challenges.
- Completion status.

Exercises should support different formats:
- Timed exercises.
- Repetition-based exercises.
- BPM progression exercises.
- Free practice.
- Song-learning sessions.
- Recording and assessment sessions.

The initial program is a 14-day intermediate training plan.

The schedule should account for the following dates:
- November 8, 2026: Initial baseline assessment.
- November 9: Day 1.
- November 10: Rest day.
- November 17: Rest day (Kreator concert).
- November 24: Final assessment (Day 14).

Rest days should not count as missed training sessions or negatively affect progress.

### 3.3 Practice Log

Allow the user to record the results of each practice session.

Suggested fields:
- Date.
- Training day.
- Practice duration.
- Perceived difficulty (1–10).
- BPM achieved.
- Exercises completed.
- Personal observations.
- What went well.
- What needs improvement.
- Focus for the next session.

The user should be able to edit previous entries.

### 3.4 BPM and Technical Progress Tracking

Provide a dedicated section for tracking technical benchmarks over time.

Track separate measurements for:
- Single-stroke roll.
- Double-stroke roll.
- Paradiddles.
- Kick speed.
- Metal groove speed.
- Other custom exercises.

For each measurement, record:
- BPM.
- Note subdivision (eighths, sixteenths, etc.).
- Duration or number of repetitions.
- Whether the result was clean and consistent.
- Date of measurement.

Allow the user to compare historical results and visualize progress using simple charts.

Important: distinguish between a maximum achievable speed and a sustainable, clean playing speed.

### 3.5 Baseline and Final Assessment

Include a dedicated assessment mode for comparing performance before and after a training program.

For the initial 14-day program, the assessment should include:

1. Recording a familiar but challenging song from beginning to end.
2. Recording two minutes of natural improvisation.
3. Measuring clean maximum BPM for selected technical exercises.
4. Recording observations about endurance, coordination, consistency, and musicality.

The final assessment should repeat the same exercises and recording conditions.

The application should allow the user to enter recording filenames or external links, but does not need to host audio or video files itself.

Provide a comparison view showing:
- Initial BPM versus final BPM.
- Practice consistency.
- Self-assessed difficulty.
- Improvements and remaining weaknesses.
- Personal notes from both assessments.

### 3.6 Exercise Library

Create a reusable exercise library.

Each exercise should support:
- Name.
- Description and instructions.
- Technical category.
- Difficulty.
- Recommended BPM.
- Note subdivision.
- Suggested duration.
- Optional personal notes.

Exercises should be reusable across multiple training programs.

Allow custom exercises to be added manually.

### 3.7 Progress Visualization

Provide a simple statistics section with:
- Total practice hours.
- Number of completed sessions.
- Average session duration.
- Training consistency.
- BPM progression charts.
- Historical assessment comparisons.

Avoid excessive gamification. The purpose is to provide useful feedback, not to turn practice into a competitive scoring system.

## 4. User Interface and Design

The application should have a clean, modern interface with a subtle metal-inspired aesthetic.

Suggested visual direction:
- Dark theme as the primary appearance.
- High-contrast typography.
- Restrained accent colors.
- Clear cards and structured layouts.
- Compact but readable exercise information.
- Responsive layout for desktop and mobile.

Avoid overly decorative elements, excessive animations, and unnecessary visual complexity.

The interface should make it easy to start a practice session and record its results with minimal interaction.

## 5. Data Storage and Persistence

The application should preserve user progress between visits.

For the initial version, local browser storage is acceptable.

However, structure the data layer so that it can later be replaced with a backend database.

Important requirements:
- Training progress must survive page refreshes.
- Practice logs must be editable.
- Data should be exportable to JSON.
- Data should be importable from a previously exported backup.
- Avoid coupling application logic directly to localStorage.

If a backend is introduced later, the application should be able to support user authentication and synchronization across devices.

## 6. Technical Requirements

Preferred implementation:
- Standard web technologies or a lightweight frontend framework.
- TypeScript preferred.
- Responsive CSS.
- Minimal external dependencies.
- No unnecessary backend infrastructure for the initial release.

The application should be deployable as a static website if local storage is used.

Code quality:
- Modular architecture.
- Reusable UI components.
- Clearly separated training data and application logic.
- Strong typing for training programs, exercises, and practice records.
- Simple, maintainable state management.

## 7. Suggested Data Models

**TrainingProgram**
- id
- name
- description
- duration
- difficulty
- days
- startDate

**TrainingDay**
- id
- dayNumber
- date
- title
- focus
- exercises
- isRestDay
- completionStatus

**Exercise**
- id
- name
- category
- instructions
- targetBpm
- subdivision
- duration
- sets
- repetitions

**PracticeSession**
- id
- date
- trainingDayId
- duration
- difficulty
- completedExercises
- achievedBpm
- notes

**TechnicalBenchmark**
- id
- exerciseId
- date
- bpm
- subdivision
- duration
- isClean
- notes

**Assessment**
- id
- date
- songRecording
- improvisationRecording
- benchmarks
- observations

## 8. Development Priorities

### Phase 1 — MVP
- Training dashboard.
- 14-day training program.
- Daily exercise checklist.
- Practice logging.
- Persistent local storage.
- JSON export/import.
- Responsive dark UI.

### Phase 2 — Progress Tracking
- Technical benchmark history.
- BPM progression charts.
- Baseline/final assessment comparison.
- Training statistics.

### Phase 3 — Extensibility
- Custom training programs.
- Exercise library management.
- Custom exercises.
- Backend synchronization.
- Optional user accounts.

## 9. Important Design Philosophy

The application should encourage sustainable improvement.

It must distinguish between:
- Practicing regularly and practicing perfectly.
- Maximum speed and controlled speed.
- Completing exercises and actually mastering them.
- Structured training and spontaneous playing.

Rest days should be treated as a normal part of the training schedule.

The user should always be able to practice outside the predefined program without breaking its progress tracking.

Ultimately, the application should help turn deliberate practice into measurable technical improvement while preserving the most important part of drumming: the enjoyment of playing.