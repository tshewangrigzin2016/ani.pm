export type LocaleTag =
  | 'en-AU'
  | 'pt-BR'
  | 'en-US'
  | 'en-GB'
  | 'fr-FR'
  | 'de-DE'
  | 'en-IN'
  | 'id-ID'
  | 'en-JM'
  | 'ja-JP'
  | 'ms-MY'
  | 'es-MX'
  | 'nl-NL'
  | 'fil-PH'
  | 'ar-SA'
  | 'en-SG'
  | 'en-ZA'
  | 'sv-SE'
  | 'ar-AE';

export type TextDir = 'ltr' | 'rtl';

export interface LocaleEntry {
  label: string;
  tag: LocaleTag;
  dir: TextDir;
  nativeHint?: string;
}

export type TranslationNamespace = Record<string, string>;
export type LocaleCatalog = Record<string, TranslationNamespace>;
