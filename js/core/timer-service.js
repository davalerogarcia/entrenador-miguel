const TIMER_STATUSES = Object.freeze({
  INACTIVE: 'inactivo',
  RUNNING: 'en curso',
  FINISHED: 'finalizado',
  SKIPPED: 'saltado'
});

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function toDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isValidNow(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function isValidRestState(rest) {
  if (!rest || typeof rest !== 'object' || Array.isArray(rest)) {
    return false;
  }

  const startedAt = toDate(rest.startedAt);
  const endsAt = toDate(rest.endsAt);

  return Number.isInteger(rest.durationSeconds) &&
    rest.durationSeconds >= 0 &&
    startedAt !== null &&
    endsAt !== null &&
    endsAt.getTime() >= startedAt.getTime();
}

function calculateRemainingSeconds(endsAt, now) {
  return Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 1000));
}

function createTimerSnapshot(rest, now, forcedStatus = null) {
  if (!isValidRestState(rest) || !isValidNow(now)) {
    return null;
  }

  const endsAt = toDate(rest.endsAt);
  const remainingSeconds = calculateRemainingSeconds(endsAt, now);
  const status = forcedStatus ?? (
    remainingSeconds === 0
      ? TIMER_STATUSES.FINISHED
      : TIMER_STATUSES.RUNNING
  );

  return {
    type: 'descanso',
    totalSeconds: rest.durationSeconds,
    endsAt: rest.endsAt,
    remainingSeconds: status === TIMER_STATUSES.SKIPPED ? 0 : remainingSeconds,
    status
  };
}

export function getRestTimerState(rest, now = new Date()) {
  return createTimerSnapshot(rest, now);
}

export function recoverRestTimer(activeSession, now = new Date()) {
  if (
    !activeSession ||
    typeof activeSession !== 'object' ||
    activeSession.currentStage !== 'descanso' ||
    !isValidRestState(activeSession.rest)
  ) {
    return null;
  }

  return createTimerSnapshot(activeSession.rest, now);
}

export function updateRestTimer(timerState, now = new Date()) {
  if (
    !timerState ||
    typeof timerState !== 'object' ||
    timerState.type !== 'descanso' ||
    !Number.isInteger(timerState.totalSeconds) ||
    timerState.totalSeconds < 0 ||
    toDate(timerState.endsAt) === null ||
    !isValidNow(now)
  ) {
    return null;
  }

  if (timerState.status === TIMER_STATUSES.SKIPPED) {
    return clone(timerState);
  }

  const remainingSeconds = calculateRemainingSeconds(toDate(timerState.endsAt), now);

  return {
    type: 'descanso',
    totalSeconds: timerState.totalSeconds,
    endsAt: timerState.endsAt,
    remainingSeconds,
    status: remainingSeconds === 0
      ? TIMER_STATUSES.FINISHED
      : TIMER_STATUSES.RUNNING
  };
}

export function skipRestTimer(rest, now = new Date()) {
  return createTimerSnapshot(rest, now, TIMER_STATUSES.SKIPPED);
}

export function isRestTimerFinished(timerState) {
  return timerState?.type === 'descanso' &&
    (timerState.status === TIMER_STATUSES.FINISHED || timerState.status === TIMER_STATUSES.SKIPPED) &&
    timerState.remainingSeconds === 0;
}

export { TIMER_STATUSES };
