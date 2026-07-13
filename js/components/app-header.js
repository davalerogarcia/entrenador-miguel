import { createElement, on, setText } from '../utils/dom-utils.js';

export function createAppHeader({ title = '', action = null } = {}) {
  const header = createElement('header', { className: 'app-header' });
  const titleElement = createElement('h1', {
    className: 'app-header__title',
    text: title,
    attributes: { tabindex: '-1' }
  });
  const actionButton = createElement('button', {
    className: 'app-header__action',
    attributes: { type: 'button' }
  });

  header.append(titleElement, actionButton);

  const current = { title, action };
  let cleanupAction = () => {};

  function render() {
    setText(titleElement, current.title);
    cleanupAction();
    cleanupAction = () => {};

    if (!current.action) {
      actionButton.hidden = true;
      actionButton.disabled = false;
      actionButton.removeAttribute('aria-label');
      actionButton.replaceChildren();
      return;
    }

    actionButton.hidden = false;
    actionButton.disabled = Boolean(current.action.disabled);
    actionButton.setAttribute('aria-label', String(current.action.label || current.action.text || 'Acción'));
    setText(actionButton, current.action.text || '');
    cleanupAction = on(actionButton, 'click', (event) => {
      if (!actionButton.disabled && typeof current.action?.onActivate === 'function') {
        current.action.onActivate(event);
      }
    });
  }

  function update(next = {}) {
    if (Object.prototype.hasOwnProperty.call(next, 'title') && next.title !== null) {
      current.title = next.title;
    }
    if (Object.prototype.hasOwnProperty.call(next, 'action')) {
      current.action = next.action;
    }
    render();
  }

  function destroy() {
    cleanupAction();
    header.remove();
  }

  render();
  return { element: header, titleElement, actionButton, update, destroy };
}
