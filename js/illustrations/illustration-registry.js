const illustrationFactories = new Map();

export function registerIllustration(id, factory) {
  if (typeof id !== 'string' || !id.trim() || typeof factory !== 'function') {
    return false;
  }

  illustrationFactories.set(id, factory);
  return true;
}

export function hasIllustration(id) {
  return illustrationFactories.has(id);
}

export function createIllustration(id) {
  const factory = illustrationFactories.get(id);
  if (!factory) {
    return null;
  }

  const illustration = factory();
  return illustration instanceof SVGElement ? illustration : null;
}

export function getRegisteredIllustrationIds() {
  return Object.freeze([...illustrationFactories.keys()]);
}
