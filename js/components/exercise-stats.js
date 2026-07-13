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

  function render() {
    const fields = {
      set: { label: current.setLabel, value: current.set },
      target: { label: current.targetLabel, value: current.target },
      load: { label: current.loadLabel, value: current.load }
    };

    Object.entries(fields).forEach(([key, field]) => {
      setText(values.get(key).term, field.label);
      setText(values.get(key).value, field.value);
    });
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
  return { element: root, update, destroy: () => root.remove() };
}
