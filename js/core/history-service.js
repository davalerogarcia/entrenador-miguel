import { SESSION_LIBRARY } from '../data/session-library.js';
import {
  getLocalWeekRange,
  isDateWithinRange,
  parseLocalDate,
  toLocalDateOnly
} from '../utils/date-utils.js';
import {
  getNextSequencePosition,
  getSessionIdAtSequencePosition,
  getWeeklySequence
} from './plan-service.js';

const sessionById = new Map(SESSION_LIBRARY.map((session) => [session.id, session]));

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function createEntryId(activeSession) {
  return `history-${activeSession.id}`;
}

export function createHistoryEntry(activeSession) {
  if (!activeSession || typeof activeSession !== 'object' || activeSession.isCompleted !== true) {
    return null;
  }

  const session = sessionById.get(activeSession.sessionId);
  const completedAt = activeSession.completedAt;

  if (
    !session ||
    !session.sequencePosition.includes(activeSession.sequencePosition) ||
    typeof completedAt !== 'string' ||
    Number.isNaN(Date.parse(completedAt))
  ) {
    return null;
  }

  const completedExerciseIds = Array.isArray(activeSession.completedExerciseIds)
    ? [...activeSession.completedExerciseIds]
    : [];
  const totalExerciseCount = Array.isArray(activeSession.plannedExerciseIds)
    ? activeSession.plannedExerciseIds.length
    : 0;

  return {
    id: createEntryId(activeSession),
    sessionId: session.id,
    sessionName: session.shortName || session.name,
    sequencePosition: activeSession.sequencePosition,
    phaseId: activeSession.phaseId,
    planWeek: activeSession.planWeek,
    startedAt: activeSession.startedAt,
    completedAt,
    calendarDate: toLocalDateOnly(completedAt),
    durationSeconds: activeSession.elapsedSeconds,
    completedExerciseCount: completedExerciseIds.length,
    totalExerciseCount,
    completedExerciseIds,
    fatigueMode: session.supportsFatigueReduction ? activeSession.fatigueMode === true : false,
    status: 'completada'
  };
}

export function addHistoryEntry(history, entry) {
  const safeHistory = Array.isArray(history) ? history : [];

  if (!entry || typeof entry.id !== 'string' || safeHistory.some((item) => item.id === entry.id)) {
    return [...safeHistory];
  }

  return [clone(entry), ...safeHistory].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)
  );
}

export function getLastCompletedEntry(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  const latest = [...history].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)
  )[0];

  return clone(latest ?? null);
}

export function getEntriesForWeek(history, referenceDate = new Date()) {
  const range = getLocalWeekRange(referenceDate);

  if (!Array.isArray(history) || !range) {
    return [];
  }

  return history
    .filter((entry) => isDateWithinRange(entry.completedAt, range))
    .map((entry) => clone(entry));
}

export function countCompletedThisWeek(history, referenceDate = new Date()) {
  const range = getLocalWeekRange(referenceDate);

  if (!Array.isArray(history) || !range) {
    return 0;
  }

  const completedDates = new Set(
    history
      .filter((entry) => {
        const calendarDate = parseLocalDate(entry?.calendarDate);
        return calendarDate !== null && isDateWithinRange(calendarDate, range);
      })
      .map((entry) => entry.calendarDate)
  );

  return completedDates.size;
}

export function getNextSequencePositionFromHistory(history) {
  const lastEntry = getLastCompletedEntry(history);

  if (!lastEntry) {
    return 1;
  }

  return getNextSequencePosition(lastEntry.sequencePosition);
}

export function getRecommendedSessionId(history) {
  return getSessionIdAtSequencePosition(getNextSequencePositionFromHistory(history));
}

export function getNextStrengthSessionId(history) {
  const sequence = getWeeklySequence();
  let position = getNextSequencePositionFromHistory(history);

  for (let offset = 0; offset < sequence.length; offset += 1) {
    const sessionId = sequence[position - 1];
    const session = sessionById.get(sessionId);

    if (session?.type === 'fuerza') {
      return sessionId;
    }

    position = position === sequence.length ? 1 : position + 1;
  }

  return null;
}
