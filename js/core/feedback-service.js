function getAudioContextConstructor(globalObject) {
  return globalObject?.AudioContext ?? globalObject?.webkitAudioContext ?? null;
}

export function canVibrate(navigatorObject = globalThis.navigator) {
  return typeof navigatorObject?.vibrate === 'function';
}

export function vibrateOnRestFinished(navigatorObject = globalThis.navigator) {
  if (!canVibrate(navigatorObject)) {
    return false;
  }

  try {
    return navigatorObject.vibrate([150, 80, 150]) !== false;
  } catch {
    return false;
  }
}

export async function playRestFinishedSound(globalObject = globalThis) {
  const AudioContextConstructor = getAudioContextConstructor(globalObject);

  if (!AudioContextConstructor) {
    return false;
  }

  let audioContext = null;

  try {
    audioContext = new AudioContextConstructor();

    if (audioContext.state === 'suspended' && typeof audioContext.resume === 'function') {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startAt = audioContext.currentTime;
    const stopAt = startAt + 0.18;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt);

    oscillator.addEventListener('ended', () => {
      if (typeof audioContext.close === 'function') {
        audioContext.close().catch(() => {});
      }
    }, { once: true });

    return true;
  } catch {
    if (audioContext && typeof audioContext.close === 'function') {
      try {
        await audioContext.close();
      } catch {
        // El feedback es opcional y nunca debe interrumpir el flujo.
      }
    }

    return false;
  }
}

export async function notifyRestFinished({
  navigatorObject = globalThis.navigator,
  globalObject = globalThis
} = {}) {
  const vibrationTriggered = vibrateOnRestFinished(navigatorObject);
  const soundTriggered = await playRestFinishedSound(globalObject);

  return {
    vibrationTriggered,
    soundTriggered
  };
}
