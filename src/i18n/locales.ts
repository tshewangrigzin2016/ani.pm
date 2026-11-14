import type { LocaleEntry, LocaleTag, TextDir } from '@/src/types/i18n';

export const LOCALES: readonly LocaleEntry[] = [
  { label: 'Australia', tag: 'en-AU', dir: 'ltr' },
  { label: 'Brazil', tag: 'pt-BR', dir: 'ltr' },
  { label: 'English', tag: 'en-US', dir: 'ltr' },
  { label: 'English (UK)', tag: 'en-GB', dir: 'ltr' },
  { label: 'France', tag: 'fr-FR', dir: 'ltr' },
  { label: 'German', tag: 'de-DE', dir: 'ltr' },
  { label: 'India', tag: 'en-IN', dir: 'ltr' },
  { label: 'Indonesia', tag: 'id-ID', dir: 'ltr' },
  { label: 'Jamaica', tag: 'en-JM', dir: 'ltr' },
  { label: 'Japan', tag: 'ja-JP', dir: 'ltr' },
  { label: 'Malaysia', tag: 'ms-MY', dir: 'ltr' },
  { label: 'Mexico', tag: 'es-MX', dir: 'ltr' },
  { label: 'Netherlands', tag: 'nl-NL', dir: 'ltr' },
  { label: 'Philippines', tag: 'fil-PH', dir: 'ltr' },
  { label: 'Saudi Arabia', tag: 'ar-SA', dir: 'rtl' },
  { label: 'Singapore', tag: 'en-SG', dir: 'ltr' },
  { label: 'South Africa', tag: 'en-ZA', dir: 'ltr' },
  { label: 'Sweden', tag: 'sv-SE', dir: 'ltr' },
  { label: 'United Arab Emirates', tag: 'ar-AE', dir: 'rtl' },
] as const;

export const DEFAULT_LOCALE: LocaleTag = 'en-US';

const LOCALE_MAP = new Map<LocaleTag, LocaleEntry>(
  LOCALES.map((entry) => [entry.tag, entry])
);

export function isValidLocale(tag: unknown): tag is LocaleTag {
  return typeof tag === 'string' && LOCALE_MAP.has(tag as LocaleTag);
}

export function getLocaleEntry(tag: LocaleTag): LocaleEntry {
  return LOCALE_MAP.get(tag) ?? LOCALE_MAP.get(DEFAULT_LOCALE)!;
}

export function getLocaleDir(tag: LocaleTag): TextDir {
  return getLocaleEntry(tag).dir;
}

export function detectBrowserLocale(languages: readonly string[] = []): LocaleTag {
  for (const raw of languages) {
    if (isValidLocale(raw)) return raw;
  }
  for (const raw of languages) {
    const base = String(raw).split('-')[0]?.toLowerCase();
    if (!base) continue;
    const match = LOCALES.find(
      (entry) => entry.tag.split('-')[0]?.toLowerCase() === base
    );
    if (match) return match.tag;
  }
  return DEFAULT_LOCALE;
}
