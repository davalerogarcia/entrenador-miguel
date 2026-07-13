import { createElement, setText } from '../utils/dom-utils.js';

const VALID_ROLES = new Set(['session-a', 'session-b', 'session-c', 'ankle', 'rest']);

export function createSessionCard({ name = '', subtitle = '', duration = '', exerciseCount = '', material = '', colorRole = '' } = {}) {
  const article = createElement('article', { className: 'session-card' });
  const heading = createElement('h2', { className: 'session-card__title' });
  const subtitleElement = createElement('p', { className: 'session-card__subtitle' });
  const meta = createElement('dl', { className: 'session-card__meta' });

  const fields = [
    ['Duración', 'duration'],
    ['Ejercicios', 'exerciseCount'],
    ['Material', 'material']
  ].map(([label, key]) => {
    const group = createElement('div', { className: 'session-card__meta-item' });
    const term = createElement('dt', { text: label });
    const value = createElement('dd');
    group.append(term, value);
    meta.append(group);
    return [key, value];
  });

  const values = Object.fromEntries(fields);
  article.append(heading, subtitleElement, meta);

  const current = { name, subtitle, duration, exerciseCount, material, colorRole };

  function render() {
    setText(heading, current.name);
    setText(subtitleElement, current.subtitle);
    setText(values.duration, current.duration);
    setText(values.exerciseCount, current.exerciseCount);
    setText(values.material, current.material);
    article.dataset.session = VALID_ROLES.has(current.colorRole) ? current.colorRole : '';
  }

  function update(next = {}) {
    for (const key of Object.keys(current)) {
      if (Object.prototype.hasOwnProperty.call(next, key) && next[key] !== null) {
        current[key] = next[key];
      }
    }
    render();
  }

  render();
  return { element: article, update, destroy: () => article.remove() };
}
