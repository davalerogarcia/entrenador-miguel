const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value) {
  return String(value).padStart(2, '0');
}

export function isValidDateOnly(value) {
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseLocalDate(value) {
  if (!isValidDateOnly(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toLocalDateOnly(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfLocalDay(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

export function getPlanWeek(planStartDate, referenceDate = new Date()) {
  const start = parseLocalDate(planStartDate);
  const reference = startOfLocalDay(referenceDate);

  if (!start || !reference) {
    return null;
  }

  start.setHours(0, 0, 0, 0);
  const elapsedDays = Math.floor((reference.getTime() - start.getTime()) / 86400000);

  return Math.floor(elapsedDays / 7) + 1;
}

export function getLocalWeekRange(referenceDate = new Date()) {
  const reference = startOfLocalDay(referenceDate);

  if (!reference) {
    return null;
  }

  const day = reference.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const start = new Date(reference);
  start.setDate(start.getDate() - daysFromMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function isDateWithinRange(value, range) {
  const date = value instanceof Date ? value : new Date(value);

  if (
    Number.isNaN(date.getTime()) ||
    !range ||
    !(range.start instanceof Date) ||
    !(range.end instanceof Date)
  ) {
    return false;
  }

  return date >= range.start && date <= range.end;
}

export function formatLocalDate(value, locale = 'es-ES', options = {}) {
  const date = typeof value === 'string' && DATE_ONLY_PATTERN.test(value)
    ? parseLocalDate(value)
    : value instanceof Date
      ? value
      : new Date(value);

  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function differenceInWholeSeconds(startValue, endValue) {
  const start = startValue instanceof Date ? startValue : new Date(startValue);
  const end = endValue instanceof Date ? endValue : new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}
