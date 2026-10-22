export interface GameSettings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  animationIntensity: 'full' | 'reduced' | 'minimal';
  reducedMotion: boolean;
}

const STORAGE_KEY = 'pixel_realms_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  sfxEnabled: true,
  musicEnabled: true,
  animationIntensity: 'full',
  reducedMotion: false,
};

type SettingsListener = (settings: GameSettings) => void;
const listeners: Set<SettingsListener> = new Set();

export function getStoredSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      sfxEnabled: typeof parsed.sfxEnabled === 'boolean' ? parsed.sfxEnabled : DEFAULT_SETTINGS.sfxEnabled,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
      animationIntensity: ['full', 'reduced', 'minimal'].includes(parsed.animationIntensity)
        ? parsed.animationIntensity
        : DEFAULT_SETTINGS.animationIntensity,
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    };
  } catch (err) {
    console.warn('Failed to read settings from localStorage:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveStoredSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    listeners.forEach((listener) => {
      try {
        listener(settings);
      } catch (err) {
        console.error('Error notifying settings listener:', err);
      }
    });
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export function subscribeSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
