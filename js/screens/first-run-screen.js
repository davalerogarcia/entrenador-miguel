import { createElement, onMany } from '../utils/dom-utils.js';
import { createPrimaryButton } from '../components/primary-button.js';
import { MESSAGES } from '../data/messages.js';
import { toLocalDateOnly } from '../utils/date-utils.js';

export function createFirstRunScreen({ onComplete } = {}) {
  const root = createElement('section', { className: 'screen screen--first-run', attributes: { 'aria-labelledby': 'first-run-title' } });
  const title = createElement('h1', { text: MESSAGES.firstRun.title, attributes: { id: 'first-run-title', tabindex: '-1' } });
  const notice = createElement('p', { className: 'medical-notice', text: MESSAGES.medicalDisclaimer });
  const form = createElement('form', { className: 'form-stack' });
  const dateLabel = createElement('label', { text: MESSAGES.firstRun.startDateLabel, attributes: { for: 'plan-start-date' } });
  const dateInput = createElement('input', { attributes: { id: 'plan-start-date', name: 'planStartDate', type: 'date', required: '', value: toLocalDateOnly(new Date()) } });
  const phaseLabel = createElement('label', { text: MESSAGES.firstRun.phaseLabel, attributes: { for: 'initial-phase' } });
  const phase = createElement('select', { attributes: { id: 'initial-phase', disabled: '' } });
  phase.append(createElement('option', { text: 'Fase 1 · Adaptación', attributes: { value: '1', selected: '' } }));
  const submit = createPrimaryButton({
    label: MESSAGES.firstRun.confirm,
    onActivate: () => form.requestSubmit()
  });
  form.append(dateLabel, dateInput, phaseLabel, phase, submit.element);
  root.append(title, notice, form);
  const cleanup = onMany([{ element: form, eventName: 'submit', handler: (event) => { event.preventDefault(); if (dateInput.reportValidity()) onComplete?.({ planStartDate: dateInput.value, activePhaseId: 1 }); } }]);
  return { element: root, focusTarget: title, destroy() { cleanup(); submit.destroy(); root.remove(); } };
}
