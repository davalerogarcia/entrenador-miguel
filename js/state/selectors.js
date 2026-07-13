import { getPlanWeek } from '../utils/date-utils.js';
import {
  getAvailableExercisesForSession,
  getExerciseById,
  getPhaseById,
  getSessionById
} from '../core/plan-service.js';
import {
  countCompletedThisWeek,
  getLastCompletedEntry,
  getNextStrengthSessionId,
  getRecommendedSessionId
} from '../core/history-service.js';

export function selectActivePhase(state) {
  return getPhaseById(state?.settings?.activePhaseId) ?? null;
}

export function selectCurrentPlanWeek(state, referenceDate = new Date()) {
  return getPlanWeek(state?.settings?.planStartDate, referenceDate);
}

export function selectLastCompletedEntry(state) {
  return getLastCompletedEntry(state?.history ?? []);
}

export function selectCompletedDaysThisWeek(state, referenceDate = new Date()) {
  return countCompletedThisWeek(state?.history ?? [], referenceDate);
}

export function selectRecommendedSession(state) {
  const sessionId = getRecommendedSessionId(state?.history ?? []);
  return getSessionById(sessionId);
}

export function selectNextStrengthSession(state) {
  const sessionId = getNextStrengthSessionId(state?.history ?? []);
  return getSessionById(sessionId);
}

export function selectAvailableExercisesForSession(state, sessionId, referenceDate = new Date()) {
  const phaseId = state?.settings?.activePhaseId;
  const planWeek = selectCurrentPlanWeek(state, referenceDate);

  if (!Number.isInteger(planWeek)) {
    return [];
  }

  return getAvailableExercisesForSession(sessionId, phaseId, planWeek);
}

export function selectActiveSessionProgress(state) {
  const activeSession = state?.activeSession;

  if (!activeSession || !Array.isArray(activeSession.plannedExerciseIds)) {
    return 0;
  }

  const totalSets = activeSession.plannedExerciseIds.reduce((total, exerciseId) => {
    const sets = activeSession.plannedSetsByExercise?.[exerciseId];
    return total + (Number.isInteger(sets) && sets > 0 ? sets : 0);
  }, 0);

  if (totalSets === 0) {
    return activeSession.isCompleted ? 100 : 0;
  }

  const completedSets = Object.values(activeSession.completedSetsByExercise ?? {})
    .reduce((total, sets) => total + (Number.isInteger(sets) && sets > 0 ? sets : 0), 0);

  return Math.min(100, Math.max(0, Math.round((completedSets / totalSets) * 100)));
}

export function selectCurrentExercise(state) {
  return getExerciseById(state?.activeSession?.currentExerciseId) ?? null;
}

export function selectHasInterruptedSession(state) {
  return Boolean(state?.activeSession && state.activeSession.isCompleted !== true);
}

export function selectDerivedState(state, referenceDate = new Date()) {
  const recommendedSession = selectRecommendedSession(state);
  const planWeek = selectCurrentPlanWeek(state, referenceDate);
  const activePhaseId = state?.settings?.activePhaseId;

  return {
    currentPlanWeek: planWeek,
    recommendedSessionId: recommendedSession?.id ?? null,
    nextStrengthSessionId: selectNextStrengthSession(state)?.id ?? null,
    completedDaysThisWeek: selectCompletedDaysThisWeek(state, referenceDate),
    activeSessionProgress: selectActiveSessionProgress(state),
    availableExerciseCount: recommendedSession && Number.isInteger(planWeek)
      ? getAvailableExercisesForSession(recommendedSession.id, activePhaseId, planWeek).length
      : 0
  };
}
