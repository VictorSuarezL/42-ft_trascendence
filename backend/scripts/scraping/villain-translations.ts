import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface CardTranslation {
  name: string;
  text: string;
}

export type CardTranslations = Record<string, CardTranslation>;

export interface VillainTranslation {
  name: string;
  objective: string;
  locations: Record<string, string>;
  cards: CardTranslations;
}

function assertSameTranslationKeys(
  section: string,
  source: Record<string, unknown>,
  translation: Record<string, unknown>,
): void {
  const sourceKeys = Object.keys(source).sort();
  const translationKeys = Object.keys(translation).sort();

  if (sourceKeys.join('\n') !== translationKeys.join('\n')) {
    const missing = sourceKeys.filter((key) => !(key in translation));
    const unexpected = translationKeys.filter((key) => !(key in source));

    throw new Error(
      `Invalid Spanish ${section} translations. ` +
        `Missing: ${missing.join(', ') || 'none'}. ` +
        `Unexpected: ${unexpected.join(', ') || 'none'}.`,
    );
  }
}

export function parseVillainTranslation(
  value: unknown,
  language: string,
): VillainTranslation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${language} translation must be a JSON object`);
  }

  const translation = value as Partial<VillainTranslation>;

  if (
    typeof translation.name !== 'string' ||
    !translation.name.trim() ||
    typeof translation.objective !== 'string' ||
    !translation.objective.trim() ||
    !translation.locations ||
    typeof translation.locations !== 'object' ||
    Array.isArray(translation.locations) ||
    !translation.cards ||
    typeof translation.cards !== 'object' ||
    Array.isArray(translation.cards)
  ) {
    throw new Error(`${language} translation has an invalid structure`);
  }

  for (const [locationId, location] of Object.entries(
    translation.locations,
  )) {
    if (typeof location !== 'string' || !location.trim()) {
      throw new Error(
        `Invalid ${language} translation for location "${locationId}"`,
      );
    }
  }

  for (const [cardId, card] of Object.entries(translation.cards)) {
    if (
      !card ||
      typeof card !== 'object' ||
      typeof card.name !== 'string' ||
      !card.name.trim() ||
      typeof card.text !== 'string' ||
      !card.text.trim()
    ) {
      throw new Error(
        `Invalid ${language} translation for card "${cardId}"`,
      );
    }
  }

  return translation as VillainTranslation;
}

export async function loadSpanishTranslation(
  villainId: string,
  english: VillainTranslation,
): Promise<VillainTranslation | null> {
  const translationPath = resolve(
    process.cwd(),
    'json',
    'translations',
    'villains',
    `${villainId}.json`,
  );

  let content: string;

  try {
    content = await readFile(translationPath, 'utf8');
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ENOENT') {
      console.warn(`Spanish translation not found for "${villainId}"`);
      return null;
    }

    throw error;
  }

  try {
    const translation = parseVillainTranslation(
      JSON.parse(content),
      'Spanish',
    );

    assertSameTranslationKeys(
      'location',
      english.locations,
      translation.locations,
    );
    assertSameTranslationKeys('card', english.cards, translation.cards);

    return translation;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Cannot load ${translationPath}: ${message}`);
  }
}
