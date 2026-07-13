import { createElement, focusElement, onMany } from '../utils/dom-utils.js';
import { createAppHeader } from '../components/app-header.js';
import { createPrimaryButton } from '../components/primary-button.js';
import { PHASE_LIBRARY } from '../data/phase-library.js';

export function createSettingsScreen({ settings, onBack, onSave, onHistory, onMedical } = {}) {
  const root = createElement('section', { className: 'screen screen--settings' });
  const header = createAppHeader({
    title: 'Ajustes',
    action: { text: '←', label: 'Volver', onActivate: onBack }
  });
  const form = createElement('form', { className: 'form-stack' });
  const phaseLabel = createElement('label', {
    text: 'Fase activa',
    attributes: { for: 'phase-select' }
  });
  const phase = createElement('select', { attributes: { id: 'phase-select' } });
  PHASE_LIBRARY.forEach((item) => {
    const option = createElement('option', {
      text: `${item.displayName} · ${item.name}`,
      attributes: { value: String(item.id) }
    });
    option.selected = item.id === settings.activePhaseId;
    phase.append(option);
  });

  const dateLabel = createElement('label', {
    text: 'Fecha de inicio del plan',
    attributes: { for: 'settings-date' }
  });
  const date = createElement('input', {
    attributes: {
      id: 'settings-date',
      type: 'date',
      required: '',
      value: settings.planStartDate || ''
    }
  });
  const save = createPrimaryButton({ label: 'Guardar cambios' });
  form.append(phaseLabel, phase, dateLabel, date, save.element);

  const confirmation = createElement('section', {
    className: 'resume-card',
    attributes: {
      'aria-labelledby': 'phase-confirm-title',
      tabindex: '-1'
    }
  });
  confirmation.hidden = true;
  const confirmationTitle = createElement('h2', {
    text: 'Confirmar cambio de fase',
    attributes: { id: 'phase-confirm-title', tabindex: '-1' }
  });
  const confirmationSummary = createElement('p');
  const confirmButton = createPrimaryButton({ label: 'Confirmar cambio' });
  const cancelButton = createElement('button', {
    className: 'secondary-button',
    text: 'Cancelar',
    attributes: { type: 'button' }
  });
  confirmation.append(
    confirmationTitle,
    confirmationSummary,
    confirmButton.element,
    cancelButton
  );

  const historyButton = createElement('button', {
    className: 'secondary-button',
    text: 'Ver historial',
    attributes: { type: 'button' }
  });
  const medicalButton = createElement('button', {
    className: 'secondary-button',
    text: 'Ver aviso médico',
    attributes: { type: 'button' }
  });
  root.append(header.element, form, confirmation, historyButton, medicalButton);

  let pendingSettings = null;
  const closeConfirmation = () => {
    pendingSettings = null;
    confirmation.hidden = true;
    form.hidden = false;
    historyButton.hidden = false;
    medicalButton.hidden = false;
    focusElement(phase);
  };
  const confirmChange = () => {
    if (!pendingSettings) return;
    const next = pendingSettings;
    pendingSettings = null;
    onSave?.(next);
  };

  confirmButton.update({ onActivate: confirmChange });

  const cleanup = onMany([
    {
      element: form,
      eventName: 'submit',
      handler: (event) => {
        event.preventDefault();
        if (!date.reportValidity()) return;

        const nextPhaseId = Number(phase.value);
        const nextSettings = {
          activePhaseId: nextPhaseId,
          planStartDate: date.value
        };

        if (nextPhaseId === settings.activePhaseId) {
          onSave?.(nextSettings);
          return;
        }

        const selectedPhase = PHASE_LIBRARY.find((item) => item.id === nextPhaseId);
        confirmationSummary.textContent = selectedPhase?.changeSummary || '';
        pendingSettings = nextSettings;
        form.hidden = true;
        historyButton.hidden = true;
        medicalButton.hidden = true;
        confirmation.hidden = false;
        focusElement(confirmationTitle);
      }
    },
    { element: cancelButton, eventName: 'click', handler: closeConfirmation },
    { element: historyButton, eventName: 'click', handler: onHistory },
    { element: medicalButton, eventName: 'click', handler: onMedical }
  ]);

  return {
    element: root,
    focusTarget: header.titleElement,
    destroy() {
      cleanup();
      header.destroy();
      save.destroy();
      confirmButton.destroy();
      root.remove();
    }
  };
}
