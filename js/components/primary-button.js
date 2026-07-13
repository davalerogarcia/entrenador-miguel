import { createElement, on, setText } from '../utils/dom-utils.js';

export function createPrimaryButton({ label = '', disabled = false, onActivate = null } = {}) {
  const button = createElement('button', {
    className: 'primary-button',
    text: label,
    attributes: { type: 'button' }
  });
  const current = { label, disabled: Boolean(disabled), onActivate };
  let cleanup = () => {};

  function render() {
    setText(button, current.label);
    button.disabled = current.disabled;
    button.setAttribute('aria-disabled', String(current.disabled));

    cleanup();
    cleanup = on(button, 'click', (event) => {
      if (!button.disabled && typeof current.onActivate === 'function') {
        current.onActivate(event);
      }
    });
  }

  function update(next = {}) {
    if (Object.prototype.hasOwnProperty.call(next, 'label') && next.label !== null) {
      current.label = next.label;
    }
    if (Object.prototype.hasOwnProperty.call(next, 'disabled') && next.disabled !== null) {
      current.disabled = Boolean(next.disabled);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'onActivate')) {
      current.onActivate = next.onActivate;
    }
    render();
  }

  function destroy() {
    cleanup();
    button.remove();
  }

  render();
  return { element: button, update, destroy };
}
