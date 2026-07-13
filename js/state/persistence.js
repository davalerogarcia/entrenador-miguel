import { EXERCISE_LIBRARY } from '../data/exercise-library.js';
import { PHASE_LIBRARY } from '../data/phase-library.js';
import { SESSION_LIBRARY } from '../data/session-library.js';
import { isValidDateOnly } from '../utils/date-utils.js';

export const STORAGE_KEY = 'entrenador-miguel';
export const STORAGE_SCHEMA_VERSION = 2;

const validPhaseIds = new Set(PHASE_LIBRARY.map((phase) => phase.id));
const validSessionIds = new Set(SESSION_LIBRARY.map((session) => session.id));
const validExerciseIds = new Set(EXERCISE_LIBRARY.map((exercise) => exercise.id));
const validStages = new Set(['ejercicio', 'descanso', 'completada']);
const sequencePositionsBySessionId = new Map(
  SESSION_LIBRARY.map((session) => [session.id, new Set(session.sequencePosition)])
);

function isValidSequencePosition(sessionId, sequencePosition) {
  return Number.isInteger(sequencePosition) &&
    sequencePositionsBySessionId.get(sessionId)?.has(sequencePosition) === true;
}


function resolveStorage(storage) {
  if (storage !== undefined) {
    return storage;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isIsoDateTime(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function createDefaultSettings() {
  return {
    activePhaseId: 1,
    planStartDate: null,
    medicalNoticeAccepted: false,
    firstRunCompleted: false
  };
}

export function createEmptyPersistenceState() {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    savedAt: null,
    settings: createDefaultSettings(),
    activeSession: null,
    history: [],
    lastCompletedSessionId: null
  };
}

function validateSettings(value) {
  const defaults = createDefaultSettings();

  if (!isPlainObject(value)) {
    return defaults;
  }

  return {
    activePhaseId: validPhaseIds.has(value.activePhaseId) ? value.activePhaseId : defaults.activePhaseId,
    planStartDate: value.planStartDate === null || isValidDateOnly(value.planStartDate)
      ? value.planStartDate
      : defaults.planStartDate,
    medicalNoticeAccepted: typeof value.medicalNoticeAccepted === 'boolean'
      ? value.medicalNoticeAccepted
      : defaults.medicalNoticeAccepted,
    firstRunCompleted: typeof value.firstRunCompleted === 'boolean'
      ? value.firstRunCompleted
      : defaults.firstRunCompleted
  };
}

function validateRest(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isPlainObject(value)) {
    return null;
  }

  const isValid =
    Number.isInteger(value.durationSeconds) && value.durationSeconds >= 0 &&
    isIsoDateTime(value.startedAt) &&
    isIsoDateTime(value.endsAt) &&
    (value.previousExerciseId === null || validExerciseIds.has(value.previousExerciseId)) &&
    (value.nextExerciseId === null || validExerciseIds.has(value.nextExerciseId)) &&
    (value.nextSet === null || (Number.isInteger(value.nextSet) && value.nextSet > 0));

  if (!isValid) {
    return null;
  }

  return {
    durationSeconds: value.durationSeconds,
    startedAt: value.startedAt,
    endsAt: value.endsAt,
    previousExerciseId: value.previousExerciseId ?? null,
    nextExerciseId: value.nextExerciseId ?? null,
    nextSet: value.nextSet ?? null
  };
}

function validateActiveSession(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isPlainObject(value)) {
    return null;
  }

  const plannedExerciseIds = Array.isArray(value.plannedExerciseIds)
    ? value.plannedExerciseIds.filter((id) => validExerciseIds.has(id))
    : [];

  if (plannedExerciseIds.length !== (value.plannedExerciseIds?.length ?? -1)) {
    return null;
  }

  const completedExerciseIds = Array.isArray(value.completedExerciseIds)
    ? value.completedExerciseIds.filter((id) => validExerciseIds.has(id))
    : [];

  const currentExerciseIdValid = value.currentExerciseId === null || validExerciseIds.has(value.currentExerciseId);
  const basicValidity =
    typeof value.id === 'string' && value.id.trim() !== '' &&
    validSessionIds.has(value.sessionId) &&
    isValidSequencePosition(value.sessionId, value.sequencePosition) &&
    validPhaseIds.has(value.phaseId) &&
    Number.isInteger(value.planWeek) && value.planWeek >= 1 &&
    isIsoDateTime(value.startedAt) &&
    isIsoDateTime(value.updatedAt) &&
    (value.completedAt === null || isIsoDateTime(value.completedAt)) &&
    Number.isInteger(value.elapsedSeconds) && value.elapsedSeconds >= 0 &&
    typeof value.fatigueMode === 'boolean' &&
    isPlainObject(value.plannedSetsByExercise) &&
    Number.isInteger(value.currentExerciseIndex) && value.currentExerciseIndex >= 0 &&
    currentExerciseIdValid &&
    Number.isInteger(value.currentSet) && value.currentSet >= 1 &&
    validStages.has(value.currentStage) &&
    isPlainObject(value.completedSetsByExercise) &&
    Number.isInteger(value.completedExerciseCount) && value.completedExerciseCount >= 0 &&
    typeof value.isCompleted === 'boolean' &&
    typeof value.historyEntryCreated === 'boolean';

  if (!basicValidity) {
    return null;
  }

  if (plannedExerciseIds.length > 0) {
    if (value.currentExerciseIndex >= plannedExerciseIds.length) {
      return null;
    }

    if (value.currentExerciseId !== plannedExerciseIds[value.currentExerciseIndex]) {
      return null;
    }
  } else if (value.currentExerciseId !== null) {
    return null;
  }

  const rest = validateRest(value.rest);
  if (value.currentStage === 'descanso' && !rest) {
    return null;
  }

  if (value.currentStage !== 'descanso' && value.rest !== null && value.rest !== undefined) {
    return null;
  }

  return {
    ...value,
    plannedExerciseIds: [...plannedExerciseIds],
    completedExerciseIds: [...completedExerciseIds],
    rest
  };
}

function validateHistoryEntry(value) {
  if (!isPlainObject(value)) {
    return null;
  }

  const completedExerciseIds = Array.isArray(value.completedExerciseIds)
    ? value.completedExerciseIds.filter((id) => validExerciseIds.has(id))
    : null;

  const valid =
    typeof value.id === 'string' && value.id.trim() !== '' &&
    validSessionIds.has(value.sessionId) &&
    isValidSequencePosition(value.sessionId, value.sequencePosition) &&
    typeof value.sessionName === 'string' && value.sessionName.trim() !== '' &&
    validPhaseIds.has(value.phaseId) &&
    Number.isInteger(value.planWeek) && value.planWeek >= 1 &&
    isIsoDateTime(value.startedAt) &&
    isIsoDateTime(value.completedAt) &&
    isValidDateOnly(value.calendarDate) &&
    Number.isInteger(value.durationSeconds) && value.durationSeconds >= 0 &&
    Number.isInteger(value.completedExerciseCount) && value.completedExerciseCount >= 0 &&
    Number.isInteger(value.totalExerciseCount) && value.totalExerciseCount >= 0 &&
    value.completedExerciseCount <= value.totalExerciseCount &&
    completedExerciseIds !== null &&
    completedExerciseIds.length === value.completedExerciseIds.length &&
    typeof value.fatigueMode === 'boolean' &&
    value.status === 'completada';

  if (!valid || Date.parse(value.completedAt) < Date.parse(value.startedAt)) {
    return null;
  }

  return {
    ...value,
    completedExerciseIds: [...completedExerciseIds]
  };
}

function validateHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set();
  const validated = [];

  value.forEach((entry) => {
    const validEntry = validateHistoryEntry(entry);

    if (validEntry && !seenIds.has(validEntry.id)) {
      seenIds.add(validEntry.id);
      validated.push(validEntry);
    }
  });

  return validated;
}

export function validatePersistenceState(value) {
  const empty = createEmptyPersistenceState();

  if (!isPlainObject(value) || value.schemaVersion !== STORAGE_SCHEMA_VERSION) {
    return empty;
  }

  const history = validateHistory(value.history);
  const validHistoryIds = new Set(history.map((entry) => entry.id));

  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    savedAt: isIsoDateTime(value.savedAt) ? value.savedAt : null,
    settings: validateSettings(value.settings),
    activeSession: validateActiveSession(value.activeSession),
    history,
    lastCompletedSessionId: validHistoryIds.has(value.lastCompletedSessionId)
      ? value.lastCompletedSessionId
      : null
  };
}

export function loadPersistence(storage) {
  storage = resolveStorage(storage);
  const empty = createEmptyPersistenceState();

  if (!storage || typeof storage.getItem !== 'function') {
    return empty;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return empty;
    }

    return validatePersistenceState(JSON.parse(raw));
  } catch {
    return empty;
  }
}

export function savePersistence(value, storage) {
  storage = resolveStorage(storage);
  if (!storage || typeof storage.setItem !== 'function') {
    return false;
  }

  try {
    const validated = validatePersistenceState({
      ...value,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      savedAt: new Date().toISOString()
    });

    validated.savedAt = new Date().toISOString();
    storage.setItem(STORAGE_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistence(storage) {
  storage = resolveStorage(storage);
  if (!storage || typeof storage.removeItem !== 'function') {
    return false;
  }

  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadActiveSessionPersistence(storage) {
  return loadPersistence(storage).activeSession;
}

export function saveActiveSessionPersistence(activeSession, storage) {
  const current = loadPersistence(storage);

  return savePersistence({
    ...current,
    activeSession
  }, storage);
}

export function clearActiveSessionPersistence(storage) {
  const current = loadPersistence(storage);

  return savePersistence({
    ...current,
    activeSession: null
  }, storage);
}
