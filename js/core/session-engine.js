import { addHistoryEntry, createHistoryEntry } from './history-service.js';
import { getExerciseById, getSessionPlan } from './plan-service.js';
import {
  clearActiveSessionPersistence,
  loadActiveSessionPersistence,
  loadPersistence,
  saveActiveSessionPersistence,
  savePersistence
} from '../state/persistence.js';

const ACTIVE_STAGES = Object.freeze({
  EXERCISE: 'ejercicio',
  REST: 'descanso',
  COMPLETED: 'completada'
});

function persistCompletedSession(activeSession, storage) {
  const historyEntry = createHistoryEntry(activeSession);

  if (!historyEntry) {
    clearActiveSessionPersistence(storage);
    return activeSession;
  }

  const persisted = loadPersistence(storage);
  const history = addHistoryEntry(persisted.history, historyEntry);
  const completedSession = {
    ...activeSession,
    historyEntryCreated: true
  };

  const saved = savePersistence({
    ...persisted,
    activeSession: null,
    history,
    lastCompletedSessionId: historyEntry.id
  }, storage);

  return saved ? completedSession : activeSession;
}

function persistSessionResult(activeSession, storage) {
  if (!activeSession) {
    clearActiveSessionPersistence(storage);
    return activeSession;
  }

  if (activeSession.isCompleted || activeSession.currentStage === ACTIVE_STAGES.COMPLETED) {
    return persistCompletedSession(activeSession, storage);
  }

  saveActiveSessionPersistence(activeSession, storage);
  return activeSession;
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function toDate(value) {
  if (isValidDate(value)) {
    return new Date(value.getTime());
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function createExecutionId(sessionId, now) {
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${sessionId}-${timestamp}-${randomPart}`;
}

function getElapsedSeconds(startedAt, now) {
  const start = toDate(startedAt);

  if (!start || !isValidDate(now)) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
}

function getEffectiveSets(exercise, phaseId, fatigueMode, supportsFatigueReduction) {
  const canonicalSets = exercise?.phaseValues?.[String(phaseId)]?.sets;

  if (!Number.isInteger(canonicalSets) || canonicalSets < 1) {
    return null;
  }

  if (fatigueMode && supportsFatigueReduction && canonicalSets >= 3) {
    return 2;
  }

  return canonicalSets;
}

function buildPlannedSets(exercises, phaseId, fatigueMode, supportsFatigueReduction) {
  const plannedSets = {};

  for (const exercise of exercises) {
    const sets = getEffectiveSets(exercise, phaseId, fatigueMode, supportsFatigueReduction);

    if (sets === null) {
      return null;
    }

    plannedSets[exercise.id] = sets;
  }

  return plannedSets;
}

function isCompatibleSequencePosition(session, sequencePosition) {
  return Number.isInteger(sequencePosition) &&
    Array.isArray(session?.sequencePosition) &&
    session.sequencePosition.includes(sequencePosition);
}

function createInitialProgressMap(exerciseIds) {
  return Object.fromEntries(exerciseIds.map((exerciseId) => [exerciseId, 0]));
}

function updateTimestamp(activeSession, now) {
  activeSession.updatedAt = now.toISOString();
  activeSession.elapsedSeconds = getElapsedSeconds(activeSession.startedAt, now);
}

function completeSession(activeSession, now) {
  activeSession.currentStage = ACTIVE_STAGES.COMPLETED;
  activeSession.isCompleted = true;
  activeSession.completedAt = now.toISOString();
  activeSession.rest = null;
  updateTimestamp(activeSession, now);
  return activeSession;
}

function createRestState(activeSession, exercise, nextSet, now) {
  const durationSeconds = Number.isInteger(exercise?.restSeconds)
    ? Math.max(0, exercise.restSeconds)
    : 0;
  const endsAt = new Date(now.getTime() + durationSeconds * 1000);

  return {
    durationSeconds,
    startedAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    previousExerciseId: exercise.id,
    nextExerciseId: exercise.id,
    nextSet
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasExactlyPlannedExercises(activeSession, plan) {
  const canonicalIds = plan.exercises.map((exercise) => exercise.id);

  return Array.isArray(activeSession.plannedExerciseIds) &&
    activeSession.plannedExerciseIds.length === canonicalIds.length &&
    activeSession.plannedExerciseIds.every((id, index) => id === canonicalIds[index]);
}

function hasValidPlannedSets(activeSession, plan) {
  if (!isPlainObject(activeSession.plannedSetsByExercise)) {
    return false;
  }

  const expected = buildPlannedSets(
    plan.exercises,
    activeSession.phaseId,
    activeSession.fatigueMode,
    plan.session.supportsFatigueReduction
  );

  if (!expected) {
    return false;
  }

  const expectedIds = Object.keys(expected);
  const actualIds = Object.keys(activeSession.plannedSetsByExercise);

  return expectedIds.length === actualIds.length &&
    expectedIds.every((exerciseId) => activeSession.plannedSetsByExercise[exerciseId] === expected[exerciseId]);
}

function hasValidProgress(activeSession) {
  const exerciseIds = activeSession.plannedExerciseIds;

  if (!isPlainObject(activeSession.completedSetsByExercise)) {
    return false;
  }

  for (const exerciseId of exerciseIds) {
    const completedSets = activeSession.completedSetsByExercise[exerciseId];
    const plannedSets = activeSession.plannedSetsByExercise[exerciseId];

    if (!Number.isInteger(completedSets) || completedSets < 0 || completedSets > plannedSets) {
      return false;
    }
  }

  if (!Array.isArray(activeSession.completedExerciseIds)) {
    return false;
  }

  const expectedCompletedIds = exerciseIds.filter(
    (exerciseId) => activeSession.completedSetsByExercise[exerciseId] === activeSession.plannedSetsByExercise[exerciseId]
  );

  if (
    expectedCompletedIds.length !== activeSession.completedExerciseIds.length ||
    !expectedCompletedIds.every((id, index) => id === activeSession.completedExerciseIds[index]) ||
    activeSession.completedExerciseCount !== expectedCompletedIds.length
  ) {
    return false;
  }

  if (exerciseIds.length === 0) {
    return activeSession.currentExerciseIndex === 0 && activeSession.currentExerciseId === null;
  }

  if (
    !Number.isInteger(activeSession.currentExerciseIndex) ||
    activeSession.currentExerciseIndex < 0 ||
    activeSession.currentExerciseIndex >= exerciseIds.length ||
    activeSession.currentExerciseId !== exerciseIds[activeSession.currentExerciseIndex]
  ) {
    return false;
  }

  const plannedSets = activeSession.plannedSetsByExercise[activeSession.currentExerciseId];
  return Number.isInteger(activeSession.currentSet) &&
    activeSession.currentSet >= 1 &&
    activeSession.currentSet <= plannedSets;
}

function hasValidStage(activeSession) {
  if (!Object.values(ACTIVE_STAGES).includes(activeSession.currentStage)) {
    return false;
  }

  if (activeSession.currentStage === ACTIVE_STAGES.REST) {
    return isPlainObject(activeSession.rest) &&
      Number.isInteger(activeSession.rest.durationSeconds) &&
      activeSession.rest.durationSeconds >= 0 &&
      toDate(activeSession.rest.startedAt) !== null &&
      toDate(activeSession.rest.endsAt) !== null &&
      activeSession.rest.previousExerciseId === activeSession.currentExerciseId &&
      activeSession.rest.nextExerciseId === activeSession.currentExerciseId &&
      activeSession.rest.nextSet === activeSession.currentSet + 1;
  }

  if (activeSession.rest !== null) {
    return false;
  }

  if (activeSession.currentStage === ACTIVE_STAGES.COMPLETED) {
    return activeSession.isCompleted === true && toDate(activeSession.completedAt) !== null;
  }

  return activeSession.isCompleted === false && activeSession.completedAt === null;
}

export function createActiveSession({
  sessionId,
  sequencePosition,
  phaseId,
  planWeek,
  fatigueMode = false,
  now = new Date(),
  storage = undefined
} = {}) {
  if (!isValidDate(now) || !Number.isInteger(planWeek) || planWeek < 1) {
    return null;
  }

  const plan = getSessionPlan(sessionId, phaseId, planWeek);

  if (!plan || !isCompatibleSequencePosition(plan.session, sequencePosition)) {
    return null;
  }

  const effectiveFatigueMode = plan.session.supportsFatigueReduction && fatigueMode === true;
  const plannedExerciseIds = plan.exercises.map((exercise) => exercise.id);
  const plannedSetsByExercise = buildPlannedSets(
    plan.exercises,
    phaseId,
    effectiveFatigueMode,
    plan.session.supportsFatigueReduction
  );

  if (!plannedSetsByExercise) {
    return null;
  }

  const startedAt = now.toISOString();

  const activeSession = {
    id: createExecutionId(sessionId, now),
    sessionId,
    sequencePosition,
    phaseId,
    planWeek,
    startedAt,
    updatedAt: startedAt,
    completedAt: null,
    elapsedSeconds: 0,
    fatigueMode: effectiveFatigueMode,
    plannedExerciseIds,
    plannedSetsByExercise,
    currentExerciseIndex: 0,
    currentExerciseId: plannedExerciseIds[0] ?? null,
    currentSet: 1,
    currentStage: ACTIVE_STAGES.EXERCISE,
    completedSetsByExercise: createInitialProgressMap(plannedExerciseIds),
    completedExerciseIds: [],
    completedExerciseCount: 0,
    rest: null,
    isCompleted: false,
    historyEntryCreated: false
  };

  return persistSessionResult(activeSession, storage);
}

export function completeCurrentSet(activeSession, now = new Date(), storage = undefined) {
  if (!isValidDate(now)) {
    return null;
  }

  const next = recoverActiveSession(activeSession);

  if (!next || next.currentStage !== ACTIVE_STAGES.EXERCISE || next.isCompleted) {
    return null;
  }

  if (next.plannedExerciseIds.length === 0) {
    return persistSessionResult(completeSession(next, now), storage);
  }

  const exerciseId = next.currentExerciseId;
  const exercise = getExerciseById(exerciseId);
  const plannedSets = next.plannedSetsByExercise[exerciseId];

  if (!exercise || !Number.isInteger(plannedSets)) {
    return null;
  }

  next.completedSetsByExercise[exerciseId] = Math.min(
    plannedSets,
    next.completedSetsByExercise[exerciseId] + 1
  );

  if (next.completedSetsByExercise[exerciseId] < plannedSets) {
    if (exercise.restSeconds > 0) {
      next.currentStage = ACTIVE_STAGES.REST;
      next.rest = createRestState(next, exercise, next.currentSet + 1, now);
    } else {
      next.currentSet += 1;
    }

    updateTimestamp(next, now);
    return persistSessionResult(next, storage);
  }

  if (!next.completedExerciseIds.includes(exerciseId)) {
    next.completedExerciseIds.push(exerciseId);
    next.completedExerciseCount = next.completedExerciseIds.length;
  }

  const nextExerciseIndex = next.currentExerciseIndex + 1;

  if (nextExerciseIndex >= next.plannedExerciseIds.length) {
    return persistSessionResult(completeSession(next, now), storage);
  }

  next.currentExerciseIndex = nextExerciseIndex;
  next.currentExerciseId = next.plannedExerciseIds[nextExerciseIndex];
  next.currentSet = 1;
  next.currentStage = ACTIVE_STAGES.EXERCISE;
  next.rest = null;
  updateTimestamp(next, now);
  return persistSessionResult(next, storage);
}

export function continueAfterRest(activeSession, now = new Date(), storage = undefined) {
  if (!isValidDate(now)) {
    return null;
  }

  const next = recoverActiveSession(activeSession);

  if (!next || next.currentStage !== ACTIVE_STAGES.REST || !next.rest) {
    return null;
  }

  next.currentSet = next.rest.nextSet;
  next.currentStage = ACTIVE_STAGES.EXERCISE;
  next.rest = null;
  updateTimestamp(next, now);
  return persistSessionResult(next, storage);
}

export function recoverActiveSession(activeSession) {
  if (!isPlainObject(activeSession)) {
    return null;
  }

  const plan = getSessionPlan(
    activeSession.sessionId,
    activeSession.phaseId,
    activeSession.planWeek
  );

  if (
    !plan ||
    !isCompatibleSequencePosition(plan.session, activeSession.sequencePosition) ||
    typeof activeSession.id !== 'string' ||
    activeSession.id.trim() === '' ||
    toDate(activeSession.startedAt) === null ||
    toDate(activeSession.updatedAt) === null ||
    typeof activeSession.fatigueMode !== 'boolean' ||
    (activeSession.fatigueMode && !plan.session.supportsFatigueReduction) ||
    !Number.isInteger(activeSession.elapsedSeconds) ||
    activeSession.elapsedSeconds < 0 ||
    typeof activeSession.historyEntryCreated !== 'boolean' ||
    !hasExactlyPlannedExercises(activeSession, plan) ||
    !hasValidPlannedSets(activeSession, plan) ||
    !hasValidProgress(activeSession) ||
    !hasValidStage(activeSession)
  ) {
    return null;
  }

  return clone(activeSession);
}

export function recoverPersistedActiveSession(storage = undefined) {
  const persistedSession = loadActiveSessionPersistence(storage);

  if (!persistedSession) {
    clearActiveSessionPersistence(storage);
    return null;
  }

  const recovered = recoverActiveSession(persistedSession);

  if (!recovered || recovered.isCompleted || recovered.currentStage === ACTIVE_STAGES.COMPLETED) {
    clearActiveSessionPersistence(storage);
    return null;
  }

  saveActiveSessionPersistence(recovered, storage);
  return recovered;
}

export function discardActiveSession(storage = undefined) {
  clearActiveSessionPersistence(storage);
  return null;
}

export { ACTIVE_STAGES };
