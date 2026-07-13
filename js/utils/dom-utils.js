export function clearElement(element) {
  if (!(element instanceof Element)) {
    return;
  }

  element.replaceChildren();
}

export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  const {
    className,
    text,
    attributes = {},
    dataset = {},
    children = []
  } = options;

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(name, String(value));
    }
  });

  Object.entries(dataset).forEach(([name, value]) => {
    if (value !== undefined && value !== null) {
      element.dataset[name] = String(value);
    }
  });

  children.forEach((child) => {
    if (child instanceof Node) {
      element.append(child);
    }
  });

  return element;
}

export function setText(element, value) {
  if (element instanceof Element) {
    element.textContent = value === null || value === undefined ? '' : String(value);
  }
}

export function focusElement(element, options = { preventScroll: true }) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  element.focus(options);
  return document.activeElement === element;
}

export function focusFirstHeading(container) {
  if (!(container instanceof Element)) {
    return false;
  }

  const heading = container.querySelector('h1, h2, [role="heading"]');

  if (!(heading instanceof HTMLElement)) {
    return false;
  }

  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
  }

  return focusElement(heading);
}

export function on(element, eventName, handler, options) {
  if (!(element instanceof EventTarget) || typeof handler !== 'function') {
    return () => {};
  }

  element.addEventListener(eventName, handler, options);
  return () => element.removeEventListener(eventName, handler, options);
}

export function onMany(bindings) {
  if (!Array.isArray(bindings)) {
    return () => {};
  }

  const cleanups = bindings.map(({ element, eventName, handler, options }) =>
    on(element, eventName, handler, options)
  );

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
