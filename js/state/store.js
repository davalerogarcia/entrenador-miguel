import { createEmptyPersistenceState } from './persistence.js';

export const APP_STATUSES = Object.freeze({
  INITIALIZING: 'iniciando',
  READY: 'preparada',
  RECOVERABLE_ERROR: 'error recuperable'
});

export const SCREEN_IDS = Object.freeze({
  FIRST_RUN: 'primera apertura',
  HOME: 'inicio',
  EXERCISE: 'ejercicio',
  REST: 'descanso',
  COMPLETED: 'sesión completada',
  SETTINGS: 'ajustes',
  HISTORY: 'historial',
  MEDICAL_NOTICE: 'aviso médico'
});

const VALID_APP_STATUSES = new Set(Object.values(APP_STATUSES));
const VALID_SCREEN_IDS = new Set(Object.values(SCREEN_IDS));

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function createInitialTimerState() {
  return {
    type: null,
    totalSeconds: 0,
    endsAt: null,
    remainingSeconds: 0,
    status: 'inactivo'
  };
}

function createInitialDerivedState() {
  return {
    currentPlanWeek: null,
    recommendedSessionId: null,
    nextStrengthSessionId: null,
    completedDaysThisWeek: 0,
    activeSessionProgress: 0,
    availableExerciseCount: 0
  };
}

export function createInitialState(persistedState = createEmptyPersistenceState()) {
  const safePersisted = persistedState && typeof persistedState === 'object'
    ? persistedState
    : createEmptyPersistenceState();

  return {
    appStatus: APP_STATUSES.INITIALIZING,
    currentScreen: SCREEN_IDS.FIRST_RUN,
    navigationContext: {
      previousScreen: null,
      origin: null
    },
    settings: clone(safePersisted.settings),
    activeSession: clone(safePersisted.activeSession),
    history: clone(safePersisted.history),
    lastCompletedSessionId: safePersisted.lastCompletedSessionId ?? null,
    timer: createInitialTimerState(),
    derived: createInitialDerivedState()
  };
}

export function createStore(initialState = createInitialState()) {
  let state = clone(initialState);
  const listeners = new Set();

  function getState() {
    return clone(state);
  }

  function setState(nextState) {
    if (!nextState || typeof nextState !== 'object') {
      return false;
    }

    state = clone(nextState);
    listeners.forEach((listener) => listener(clone(state)));
    return true;
  }

  function updateState(updater) {
    if (typeof updater !== 'function') {
      return false;
    }

    const draft = clone(state);
    const result = updater(draft);
    return setState(result && typeof result === 'object' ? result : draft);
  }

  function setAppStatus(status) {
    if (!VALID_APP_STATUSES.has(status)) {
      return false;
    }

    return updateState((draft) => {
      draft.appStatus = status;
    });
  }

  function setCurrentScreen(screen, navigationContext = null) {
    if (!VALID_SCREEN_IDS.has(screen)) {
      return false;
    }

    return updateState((draft) => {
      draft.navigationContext = navigationContext && typeof navigationContext === 'object'
        ? {
            previousScreen: navigationContext.previousScreen ?? draft.currentScreen,
            origin: navigationContext.origin ?? null
          }
        : {
            previousScreen: draft.currentScreen,
            origin: null
          };
      draft.currentScreen = screen;
    });
  }

  function replacePersistentData(persistedState) {
    if (!persistedState || typeof persistedState !== 'object') {
      return false;
    }

    return updateState((draft) => {
      draft.settings = clone(persistedState.settings);
      draft.activeSession = clone(persistedState.activeSession);
      draft.history = clone(persistedState.history);
      draft.lastCompletedSessionId = persistedState.lastCompletedSessionId ?? null;
    });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState,
    setState,
    updateState,
    setAppStatus,
    setCurrentScreen,
    replacePersistentData,
    subscribe
  };
}
