import { createElement, focusElement, onMany, setText } from '../utils/dom-utils.js';
import { createAppHeader } from '../components/app-header.js';
import { createPrimaryButton } from '../components/primary-button.js';
import { createSessionCard } from '../components/session-card.js';
import { SESSION_LIBRARY } from '../data/session-library.js';
import { MESSAGES } from '../data/messages.js';
import { getAvailableExercisesForSession } from '../core/plan-service.js';

function roleFor(session) {
  return ({
    'session-a': 'session-a',
    'session-b': 'session-b',
    'session-c': 'session-c',
    ankle: 'ankle',
    rest: 'rest'
  })[session?.id] || '';
}

function sessionIdForPosition(position) {
  if (position === 1) return 'session-a';
  if (position === 2 || position === 4 || position === 6) return 'ankle';
  if (position === 3) return 'session-b';
  if (position === 5) return 'session-c';
  return 'rest';
}

function exerciseCountFor(sessionId, phaseId, planWeek) {
  return getAvailableExercisesForSession(sessionId, phaseId, planWeek).length;
}

export function createHomeScreen({
  dayLabel,
  weekLabel,
  phaseLabel,
  activePhaseId,
  planWeek,
  recommendedSession,
  sequencePosition,
  nextStrengthSession,
  completedDays,
  activeSession,
  onSettings,
  onStart,
  onResume,
  onDiscard
} = {}) {
  const root = createElement('section', { className: 'screen screen--home' });
  const header = createAppHeader({
    title: `${dayLabel} · ${weekLabel}`,
    action: { text: '⚙', label: MESSAGES.common.settings, onActivate: onSettings }
  });
  const phase = createElement('p', { className: 'phase-badge', text: phaseLabel });
  const greeting = createElement('h2', { text: 'Hola, Miguel', attributes: { tabindex: '-1' } });
  root.append(header.element, phase, greeting);

  const cleanups = [];
  const children = [header];

  if (activeSession) {
    const box = createElement('section', {
      className: 'resume-card',
      attributes: { 'aria-labelledby': 'resume-title' }
    });
    box.append(
      createElement('h3', {
        text: MESSAGES.resumeSession.title,
        attributes: { id: 'resume-title' }
      }),
      createElement('p', { text: MESSAGES.resumeSession.question })
    );
    const resume = createPrimaryButton({
      label: MESSAGES.resumeSession.continue,
      onActivate: onResume
    });
    const discard = createElement('button', {
      className: 'secondary-button',
      text: MESSAGES.resumeSession.discard,
      attributes: { type: 'button' }
    });
    cleanups.push(onMany([
      { element: discard, eventName: 'click', handler: onDiscard }
    ]));
    box.append(resume.element, discard);
    children.push(resume);
    root.append(box);
  } else {
    const initialSessionId = recommendedSession?.id || sessionIdForPosition(sequencePosition);
    const card = createSessionCard({
      name: recommendedSession?.shortName || '',
      subtitle: recommendedSession?.subtitle || '',
      duration: `${recommendedSession?.estimatedDurationMinutes ?? 0} min`,
      exerciseCount: `${exerciseCountFor(initialSessionId, activePhaseId, planWeek)}`,
      material: recommendedSession?.material?.join(' · ') || 'Sin material',
      colorRole: roleFor(recommendedSession)
    });
    const position = createElement('p', {
      className: 'sequence-label',
      text: `Posición ${sequencePosition} de 7`
    });
    const selectorLabel = createElement('label', {
      text: 'Elegir otra sesión',
      attributes: { for: 'session-selector' }
    });
    const selector = createElement('select', {
      attributes: { id: 'session-selector' }
    });

    [1, 2, 3, 4, 5, 6, 7].forEach((pos) => {
      const sessionId = sessionIdForPosition(pos);
      const session = SESSION_LIBRARY.find((item) => item.id === sessionId);
      const option = createElement('option', {
        text: `${pos}. ${session.shortName}`,
        attributes: { value: String(pos) }
      });
      option.selected = pos === sequencePosition;
      selector.append(option);
    });

    const selectedSessionId = () => sessionIdForPosition(Number(selector.value));
    const fatigueWrap = createElement('label', { className: 'fatigue-control' });
    const fatigue = createElement('input', { attributes: { type: 'checkbox' } });
    fatigueWrap.append(fatigue, createElement('span', { text: MESSAGES.fatigue.label }));
    const fatigueNotice = createElement('p', {
      className: 'fatigue-notice',
      text: MESSAGES.fatigue.notice
    });
    fatigueNotice.hidden = true;

    const syncFatigue = () => {
      const isStrength = ['session-a', 'session-b', 'session-c'].includes(selectedSessionId());
      fatigueWrap.hidden = !isStrength;
      fatigueNotice.hidden = !isStrength || !fatigue.checked;
      if (!isStrength) fatigue.checked = false;
    };

    const syncCard = () => {
      const sessionId = selectedSessionId();
      const session = SESSION_LIBRARY.find((item) => item.id === sessionId);
      card.update({
        name: session?.shortName || '',
        subtitle: session?.subtitle || '',
        duration: `${session?.estimatedDurationMinutes ?? 0} min`,
        exerciseCount: `${exerciseCountFor(sessionId, activePhaseId, planWeek)}`,
        material: session?.material?.join(' · ') || 'Sin material',
        colorRole: roleFor(session)
      });
      setText(position, `Posición ${selector.value} de 7`);
      syncFatigue();
    };

    const start = createPrimaryButton({ label: MESSAGES.common.startSession });
    const confirmation = createElement('section', {
      className: 'resume-card',
      attributes: {
        'aria-labelledby': 'session-c-confirm-title',
        tabindex: '-1'
      }
    });
    confirmation.hidden = true;
    const confirmationTitle = createElement('h3', {
      text: 'Antes de empezar',
      attributes: { id: 'session-c-confirm-title', tabindex: '-1' }
    });
    const confirmationText = createElement('p', {
      text: MESSAGES.sessionCNotice
    });
    const continueButton = createPrimaryButton({ label: 'Continuar' });
    const cancelButton = createElement('button', {
      className: 'secondary-button',
      text: 'Cancelar',
      attributes: { type: 'button' }
    });
    confirmation.append(
      confirmationTitle,
      confirmationText,
      continueButton.element,
      cancelButton
    );

    let pendingStart = null;
    const closeConfirmation = () => {
      confirmation.hidden = true;
      pendingStart = null;
      start.element.hidden = false;
      focusElement(start.element);
    };
    const requestStart = () => {
      const positionValue = Number(selector.value);
      const fatigueValue = fatigue.checked;
      if (selectedSessionId() !== 'session-c') {
        onStart?.(positionValue, fatigueValue);
        return;
      }
      pendingStart = { position: positionValue, fatigue: fatigueValue };
      start.element.hidden = true;
      confirmation.hidden = false;
      focusElement(confirmationTitle);
    };
    const confirmStart = () => {
      if (!pendingStart) return;
      const next = pendingStart;
      pendingStart = null;
      onStart?.(next.position, next.fatigue);
    };

    start.update({ onActivate: requestStart });
    continueButton.update({ onActivate: confirmStart });

    cleanups.push(onMany([
      { element: selector, eventName: 'change', handler: syncCard },
      { element: fatigue, eventName: 'change', handler: syncFatigue },
      { element: cancelButton, eventName: 'click', handler: closeConfirmation }
    ]));

    syncCard();
    root.append(
      card.element,
      position,
      selectorLabel,
      selector,
      fatigueWrap,
      fatigueNotice,
      start.element,
      confirmation
    );
    children.push(card, start, continueButton);
  }

  const secondary = createElement('div', { className: 'home-secondary' });
  secondary.append(
    createElement('p', { text: `Próxima fuerza: ${nextStrengthSession?.shortName || '—'}` }),
    createElement('p', { text: `${completedDays} de 7 días completados` })
  );
  root.append(secondary);

  return {
    element: root,
    focusTarget: greeting,
    destroy() {
      cleanups.forEach((cleanup) => cleanup());
      children.forEach((child) => child.destroy?.());
      root.remove();
    }
  };
}
