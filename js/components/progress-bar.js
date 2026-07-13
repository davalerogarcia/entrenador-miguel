import { createElement, setText } from '../utils/dom-utils.js';

function clampPercent(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0;
}

export function createProgressBar({ value = 0, label = 'Progreso de la sesión', showValue = true } = {}) {
  const root = createElement('div', { className: 'progress-bar' });
  const header = createElement('div', { className: 'progress-bar__header' });
  const labelElement = createElement('span', { className: 'progress-bar__label', text: label });
  const valueElement = createElement('span', { className: 'progress-bar__value' });
  const track = createElement('div', {
    className: 'progress-bar__track',
    attributes: {
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100'
    }
  });
  const fill = createElement('div', { className: 'progress-bar__fill' });

  header.append(labelElement, valueElement);
  track.append(fill);
  root.append(header, track);

  const current = {
    value: clampPercent(value),
    label,
    showValue: Boolean(showValue)
  };

  function render() {
    const roundedValue = Math.round(current.value);
    setText(labelElement, current.label);
    setText(valueElement, current.showValue ? `${roundedValue} %` : '');
    valueElement.hidden = !current.showValue;
    fill.style.width = `${current.value}%`;
    track.setAttribute('aria-label', String(current.label));
    track.setAttribute('aria-valuenow', String(roundedValue));
    track.setAttribute('aria-valuetext', `${roundedValue} % completado`);
  }

  function update(next = {}) {
    if (Object.prototype.hasOwnProperty.call(next, 'value') && next.value !== null) {
      current.value = clampPercent(next.value);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'label') && next.label !== null) {
      current.label = next.label;
    }
    if (Object.prototype.hasOwnProperty.call(next, 'showValue') && next.showValue !== null) {
      current.showValue = Boolean(next.showValue);
    }
    render();
  }

  render();
  return { element: root, update, destroy: () => root.remove() };
}

export { clampPercent };
