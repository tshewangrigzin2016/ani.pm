import type { ThemeId, ThemePreferences } from '@/src/types/settings';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  isLight: boolean;
  swatchBg: string;
  swatchSurface: string;
  swatchDot: string;
}

export const THEME_OPTIONS: readonly ThemeMeta[] = [
  { id: 'graphite', label: 'Graphite', isLight: false, swatchBg: '#100e11', swatchSurface: '#29262f', swatchDot: '#eeeaf1' },
  { id: 'noir', label: 'Noir', isLight: false, swatchBg: '#0d070b', swatchSurface: '#23141d', swatchDot: '#f3e3df' },
  { id: 'midnight', label: 'Midnight', isLight: false, swatchBg: '#07080d', swatchSurface: '#161b29', swatchDot: '#e2e7f3' },
  { id: 'obsidian', label: 'Obsidian', isLight: false, swatchBg: '#000000', swatchSurface: '#141414', swatchDot: '#f1f1f1' },
  { id: 'slate', label: 'Slate', isLight: false, swatchBg: '#0a0b0e', swatchSurface: '#1e222b', swatchDot: '#e4e7ee' },
  { id: 'forest', label: 'Forest', isLight: false, swatchBg: '#070c0a', swatchSurface: '#17231d', swatchDot: '#e2eee6' },
  { id: 'wine', label: 'Wine', isLight: false, swatchBg: '#0d0709', swatchSurface: '#26151b', swatchDot: '#f0e2e4' },
  { id: 'ocean', label: 'Ocean', isLight: false, swatchBg: '#050b0d', swatchSurface: '#132229', swatchDot: '#deecf0' },
  { id: 'light', label: 'Blush', isLight: true, swatchBg: '#f7f0ec', swatchSurface: '#fffcfa', swatchDot: '#2e1a25' },
  { id: 'paper', label: 'Paper', isLight: true, swatchBg: '#f4edde', swatchSurface: '#fcf7eb', swatchDot: '#382e20' },
  { id: 'mist', label: 'Mist', isLight: true, swatchBg: '#f0f2f6', swatchSurface: '#fcfdff', swatchDot: '#202632' },
  { id: 'snow', label: 'Snow', isLight: true, swatchBg: '#fafbfd', swatchSurface: '#ffffff', swatchDot: '#161a22' },
  { id: 'custom', label: 'Custom', isLight: false, swatchBg: '#121318', swatchSurface: '#22242c', swatchDot: '#b29ce0' },
];

export const ACCENT_SWATCHES = [
  '#b29ce0',
  '#8ac4ff',
  '#f472b6',
  '#ffc39a',
  '#6ee7b7',
  '#fde047',
  '#f87171',
  '#ffffff',
];

export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

export function applyThemeToDocument(prefs: ThemePreferences): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  let activeTheme = prefs.theme;
  if (prefs.followSystem && typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    activeTheme = prefersDark ? 'obsidian' : 'snow';
  }

  const meta = THEME_OPTIONS.find((t) => t.id === activeTheme) ?? THEME_OPTIONS[0];
  root.setAttribute('data-theme', activeTheme);
  root.setAttribute('data-theme-mode', meta.isLight ? 'light' : 'dark');
  root.setAttribute('data-text-size', prefs.textSize);
  root.setAttribute('data-animations', prefs.animations ? 'on' : 'off');
  root.setAttribute('data-glassfx', prefs.backdropBlur ? 'on' : 'off');

  const accentTriplet = hexToRgbTriplet(
    activeTheme === 'custom' ? prefs.customColors.accent : prefs.accentColor
  );
  root.style.setProperty('--c-accent', accentTriplet);
  root.style.setProperty('--c-accent-bright', accentTriplet);

  if (activeTheme === 'custom') {
    root.style.setProperty('--c-bg', hexToRgbTriplet(prefs.customColors.bg));
    root.style.setProperty('--c-surface', hexToRgbTriplet(prefs.customColors.surface));
    root.style.setProperty('--c-text', hexToRgbTriplet(prefs.customColors.text));
  } else {
    root.style.removeProperty('--c-bg');
    root.style.removeProperty('--c-surface');
    root.style.removeProperty('--c-text');
  }
}
