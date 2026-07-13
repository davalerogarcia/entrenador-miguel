import { createElement, setText } from '../utils/dom-utils.js';
import { formatClock } from '../utils/format-utils.js';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function normalizeSeconds(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

export function createCircularTimer({ totalSeconds = 0, remainingSeconds = 0, label = 'Tiempo de descanso' } = {}) {
  const root = createElement('div', { className: 'circular-timer' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'circular-timer__graphic');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('aria-hidden', 'true');

  const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  track.setAttribute('class', 'circular-timer__track');
  track.setAttribute('cx', '60');
  track.setAttribute('cy', '60');
  track.setAttribute('r', String(RADIUS));

  const progress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  progress.setAttribute('class', 'circular-timer__progress');
  progress.setAttribute('cx', '60');
  progress.setAttribute('cy', '60');
  progress.setAttribute('r', String(RADIUS));
  progress.style.strokeDasharray = String(CIRCUMFERENCE);

  svg.append(track, progress);
  const value = createElement('span', { className: 'circular-timer__value' });
  const status = createElement('span', {
    className: 'visually-hidden',
    attributes: { role: 'timer', 'aria-live': 'off', 'aria-atomic': 'true' }
  });
  root.append(svg, value, status);

  const current = {
    totalSeconds: normalizeSeconds(totalSeconds),
    remainingSeconds: normalizeSeconds(remainingSeconds),
    label
  };

  function render() {
    const total = current.totalSeconds;
    const remaining = Math.min(total || current.remainingSeconds, current.remainingSeconds);
    const ratio = total > 0 ? remaining / total : 0;
    const offset = CIRCUMFERENCE * (1 - ratio);

    progress.style.strokeDashoffset = String(offset);
    setText(value, formatClock(remaining));
    setText(status, `${current.label}: ${formatClock(remaining)} restantes`);
    root.dataset.state = remaining === 0 ? 'complete' : 'running';
  }

  function update(next = {}) {
    if (Object.prototype.hasOwnProperty.call(next, 'totalSeconds') && next.totalSeconds !== null) {
      current.totalSeconds = normalizeSeconds(next.totalSeconds);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'remainingSeconds') && next.remainingSeconds !== null) {
      current.remainingSeconds = normalizeSeconds(next.remainingSeconds);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'label') && next.label !== null) {
      current.label = next.label;
    }
    render();
  }

  render();
  return { element: root, update, destroy: () => root.remove() };
}
