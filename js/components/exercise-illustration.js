import { createElement, setText } from '../utils/dom-utils.js';
import { createIllustration } from '../illustrations/illustration-registry.js';

export function createExerciseIllustration({ illustrationId = '', exerciseName = '' } = {}) {
  const figure = createElement('figure', { className: 'exercise-illustration' });
  const canvas = createElement('div', {
    className: 'exercise-illustration__canvas',
    attributes: { role: 'img' }
  });
  const caption = createElement('figcaption', { className: 'visually-hidden' });
  figure.append(canvas, caption);

  const current = { illustrationId, exerciseName };

  function render() {
    const svg = createIllustration(current.illustrationId);

    canvas.replaceChildren();
    canvas.setAttribute('aria-label', current.exerciseName ? `Ilustración de ${current.exerciseName}` : 'Ilustración del ejercicio');
    setText(caption, current.exerciseName ? `Ilustración de ${current.exerciseName}` : 'Ilustración del ejercicio');

    if (svg) {
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('aria-hidden', 'true');
      canvas.append(svg);
      figure.dataset.status = 'ready';
    } else {
      const placeholder = createElement('span', {
        className: 'exercise-illustration__placeholder',
        text: 'Ilustración pendiente'
      });
      canvas.append(placeholder);
      figure.dataset.status = 'missing';
    }
  }

  function update(next = {}) {
    if (Object.prototype.hasOwnProperty.call(next, 'illustrationId') && next.illustrationId !== null) {
      current.illustrationId = next.illustrationId;
    }
    if (Object.prototype.hasOwnProperty.call(next, 'exerciseName') && next.exerciseName !== null) {
      current.exerciseName = next.exerciseName;
    }
    render();
  }

  render();
  return { element: figure, update, destroy: () => figure.remove() };
}
