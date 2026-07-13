function normalizeNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function formatClock(seconds) {
  const totalSeconds = Math.floor(normalizeNonNegativeNumber(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function formatDuration(seconds) {
  const totalSeconds = Math.floor(normalizeNonNegativeNumber(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min ${remainingSeconds} s`;
  }

  return `${remainingSeconds} s`;
}

export function formatSetProgress(currentSet, totalSets) {
  const current = Number.isInteger(currentSet) && currentSet > 0 ? currentSet : 0;
  const total = Number.isInteger(totalSets) && totalSets > 0 ? totalSets : 0;
  return `${current} / ${total}`;
}

export function formatTarget(phaseValue) {
  if (!phaseValue || phaseValue.available === false) {
    return 'No disponible';
  }

  const { targetType, targetValue, sideMode } = phaseValue;
  let mainValue = '';

  switch (targetType) {
    case 'tiempo':
      mainValue = `${targetValue} s`;
      break;
    case 'máximo':
      mainValue = 'Máximo con buena técnica';
      break;
    case 'recorrido':
      mainValue = targetValue === 1 ? '1 vez' : `${targetValue} veces`;
      break;
    case 'repeticiones':
    default:
      mainValue = String(targetValue ?? '');
      break;
  }

  const sideSuffix = {
    'por lado': ' por lado',
    'por pierna': ' por pierna',
    'por pie': ' por pie',
    alterno: ' alternando',
    ninguno: ''
  }[sideMode] ?? '';

  return `${mainValue}${sideSuffix}`.trim();
}

export function formatLoad(load) {
  if (!load || typeof load !== 'object') {
    return '';
  }

  if (typeof load.description === 'string' && load.description.trim()) {
    return load.description.trim();
  }

  if (load.value === null || load.value === undefined) {
    return '';
  }

  return `${load.value}${load.unit ? ` ${load.unit}` : ''}`;
}

export function formatExercisePrescription(phaseValue) {
  if (!phaseValue || phaseValue.available === false) {
    return 'No disponible';
  }

  const sets = Number.isInteger(phaseValue.sets) ? phaseValue.sets : 0;
  return `${sets} × ${formatTarget(phaseValue)}`;
}

export function formatSessionLabel(session) {
  if (!session || typeof session !== 'object') {
    return '';
  }

  return session.shortName || session.name || '';
}
