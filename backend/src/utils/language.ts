export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export function getRequestedLanguage(value: unknown): Language {
  const language = typeof value === 'string' ? value.toLowerCase() : 'en';

  return SUPPORTED_LANGUAGES.find((supported) => supported === language) ?? 'en';
}
