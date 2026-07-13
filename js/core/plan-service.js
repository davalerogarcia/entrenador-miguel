import { EXERCISE_LIBRARY } from '../data/exercise-library.js';
import { PHASE_LIBRARY } from '../data/phase-library.js';
import { SESSION_LIBRARY } from '../data/session-library.js';

const exerciseById = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));
const phaseById = new Map(PHASE_LIBRARY.map((phase) => [phase.id, phase]));
const sessionById = new Map(SESSION_LIBRARY.map((session) => [session.id, session]));

const WEEKLY_SEQUENCE = Object.freeze(
  Array.from({ length: 7 }, (_, index) => {
    const position = index + 1;
    const session = SESSION_LIBRARY.find((item) => item.sequencePosition.includes(position));
    return session?.id ?? null;
  })
);

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function getExerciseById(exerciseId) {
  return clone(exerciseById.get(exerciseId) ?? null);
}

export function getSessionById(sessionId) {
  return clone(sessionById.get(sessionId) ?? null);
}

export function getPhaseById(phaseId) {
  return clone(phaseById.get(phaseId) ?? null);
}

export function getWeeklySequence() {
  return [...WEEKLY_SEQUENCE];
}

export function getPhaseForWeek(planWeek) {
  if (!Number.isInteger(planWeek)) {
    return null;
  }

  const phase = PHASE_LIBRARY.find(
    (item) => planWeek >= item.startWeek && planWeek <= item.endWeek
  );

  return clone(phase ?? null);
}

export function isExerciseAvailable(exercise, phaseId, planWeek) {
  if (!exercise || !phaseById.has(phaseId) || !Number.isInteger(planWeek) || planWeek < 1) {
    return false;
  }

  const phaseValue = exercise.phaseValues?.[String(phaseId)];

  return Boolean(
    phaseValue?.available === true &&
    phaseId >= exercise.minimumPhase &&
    planWeek >= exercise.minimumWeek
  );
}

export function getExercisePhaseValue(exerciseId, phaseId) {
  const exercise = exerciseById.get(exerciseId);
  const phaseValue = exercise?.phaseValues?.[String(phaseId)];
  return clone(phaseValue ?? null);
}

export function getAvailableExercisesForSession(sessionId, phaseId, planWeek) {
  const session = sessionById.get(sessionId);

  if (!session || !phaseById.has(phaseId) || !Number.isInteger(planWeek) || planWeek < 1) {
    return [];
  }

  return session.exerciseIds
    .map((exerciseId) => exerciseById.get(exerciseId))
    .filter((exercise) => isExerciseAvailable(exercise, phaseId, planWeek))
    .map((exercise) => clone(exercise));
}

export function getSessionPlan(sessionId, phaseId, planWeek) {
  const session = sessionById.get(sessionId);
  const phase = phaseById.get(phaseId);

  if (!session || !phase || !Number.isInteger(planWeek) || planWeek < 1) {
    return null;
  }

  const exercises = getAvailableExercisesForSession(sessionId, phaseId, planWeek).map((exercise) => ({
    ...exercise,
    activePhaseValue: clone(exercise.phaseValues[String(phaseId)])
  }));

  const availableIds = new Set(exercises.map((exercise) => exercise.id));
  const blocks = session.blocks
    .map((block) => ({
      ...clone(block),
      exerciseIds: block.exerciseIds.filter((exerciseId) => availableIds.has(exerciseId))
    }))
    .filter((block) => block.exerciseIds.length > 0);

  return {
    session: clone(session),
    phase: clone(phase),
    planWeek,
    exercises,
    blocks
  };
}

export function getSessionIdAtSequencePosition(position) {
  return Number.isInteger(position) && position >= 1 && position <= WEEKLY_SEQUENCE.length
    ? WEEKLY_SEQUENCE[position - 1]
    : null;
}

export function getNextSequencePosition(position) {
  if (!Number.isInteger(position) || position < 1 || position > WEEKLY_SEQUENCE.length) {
    return 1;
  }

  return position === WEEKLY_SEQUENCE.length ? 1 : position + 1;
}
