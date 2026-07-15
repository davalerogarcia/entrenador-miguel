import { createElement, setText } from '../utils/dom-utils.js';

const DEFAULT_ITEMS = [
  { key: 'set', label: 'Serie' },
  { key: 'target', label: 'Reps' },
  { key: 'load', label: 'Carga' }
];

export function createExerciseStats(data = {}) {
  const root = createElement('dl', { className: 'exercise-stats' });
  const values = new Map();

  DEFAULT_ITEMS.forEach(({ key, label }) => {
    const item = createElement('div', { className: 'exercise-stats__item' });
    const term = createElement('dt', { className: 'exercise-stats__label', text: label });
    const value = createElement('dd', { className: 'exercise-stats__value' });
    item.append(term, value);
    root.append(item);
    values.set(key, { term, value });
  });

  const current = {
    set: data.set ?? '',
    setLabel: data.setLabel ?? 'Serie',
    target: data.target ?? '',
    targetLabel: data.targetLabel ?? 'Reps',
    load: data.load ?? '',
    loadLabel: data.loadLabel ?? 'Carga'
  };

  const bindings = {
    set: values.get('set').value,
    setLabel: values.get('set').term,
    target: values.get('target').value,
    targetLabel: values.get('target').term,
    load: values.get('load').value,
    loadLabel: values.get('load').term
  };

  function update(next = {}) {
    for (const key of Object.keys(current)) {
      if (!Object.prototype.hasOwnProperty.call(next, key) || next[key] === null) {
        continue;
      }
      current[key] = next[key];
      setText(bindings[key], current[key]);
    }
  }

  Object.entries(current).forEach(([key, value]) => setText(bindings[key], value));
  return { element: root, update, destroy: () => root.remove() };
}
