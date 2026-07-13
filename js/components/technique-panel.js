import { createElement, on, setText } from '../utils/dom-utils.js';

let panelCounter = 0;

export function createTechniquePanel({ label = 'Ver técnica completa', content = '', expanded = false } = {}) {
  panelCounter += 1;
  const panelId = `technique-panel-${panelCounter}`;
  const root = createElement('section', { className: 'technique-panel' });
  const button = createElement('button', {
    className: 'technique-panel__toggle',
    text: label,
    attributes: {
      type: 'button',
      'aria-controls': panelId
    }
  });
  const body = createElement('div', {
    className: 'technique-panel__body',
    attributes: { id: panelId }
  });
  const text = createElement('p', { className: 'technique-panel__text' });
  body.append(text);
  root.append(button, body);

  let isExpanded = Boolean(expanded);
  let currentLabel = label;

  function render() {
    button.setAttribute('aria-expanded', String(isExpanded));
    body.hidden = !isExpanded;
    root.classList.toggle('is-expanded', isExpanded);
    setText(button, currentLabel);
  }

  const cleanup = on(button, 'click', () => {
    isExpanded = !isExpanded;
    render();
  });

  function update(next = {}) {
    if (Object.prototype.hasOwnProperty.call(next, 'label')) {
      currentLabel = String(next.label || 'Ver técnica completa');
    }
    if (Object.prototype.hasOwnProperty.call(next, 'content')) {
      setText(text, next.content);
    } else if (!text.textContent) {
      setText(text, content);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'expanded')) {
      isExpanded = Boolean(next.expanded);
    }
    render();
  }

  function destroy() {
    cleanup();
    root.remove();
  }

  update({ label, content, expanded });
  return { element: root, button, body, update, destroy, isExpanded: () => isExpanded };
}
