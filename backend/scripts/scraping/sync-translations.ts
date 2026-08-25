import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  loadSpanishTranslation,
  parseVillainTranslation,
} from './villain-translations';

interface GeneratedVillain {
  id: string;
  translations: Record<string, unknown>;
  [key: string]: unknown;
}

function parseGeneratedVillain(
  value: unknown,
  sourcePath: string,
): GeneratedVillain {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${sourcePath} must contain a JSON object`);
  }

  const villain = value as Partial<GeneratedVillain>;

  if (
    typeof villain.id !== 'string' ||
    !villain.id.trim() ||
    !villain.translations ||
    typeof villain.translations !== 'object' ||
    Array.isArray(villain.translations)
  ) {
    throw new Error(`${sourcePath} has an invalid villain structure`);
  }

  return villain as GeneratedVillain;
}

async function syncVillainTranslation(sourcePath: string): Promise<boolean> {
  const currentContent = await readFile(sourcePath, 'utf8');
  const villain = parseGeneratedVillain(
    JSON.parse(currentContent),
    sourcePath,
  );

  const englishTranslation = parseVillainTranslation(
    villain.translations.en,
    'English',
  );

  const spanishTranslation = await loadSpanishTranslation(
    villain.id,
    englishTranslation,
  );

  if (!spanishTranslation) {
    return false;
  }

  const updatedVillain = {
    ...villain,
    translations: {
      ...villain.translations,
      es: spanishTranslation,
    },
  };

  const updatedContent = JSON.stringify(updatedVillain, null, 2) + '\n';

  if (updatedContent === currentContent) {
    console.log(`Translation already up to date: ${villain.id}`);
    return true;
  }

  const temporaryPath = `${sourcePath}.tmp`;

  await writeFile(temporaryPath, updatedContent, 'utf8');
  await rename(temporaryPath, sourcePath);

  console.log(`Translation synchronized: ${villain.id}`);

  return true;
}

async function main(): Promise<void> {
  const villainsDirectory = resolve(process.cwd(), 'json', 'villains');

  const filenames = (await readdir(villainsDirectory))
    .filter((filename) => filename.endsWith('.json'))
    .sort();

  if (filenames.length === 0) {
    throw new Error(`No villain JSON files found in ${villainsDirectory}`);
  }

  let synchronized = 0;

  for (const filename of filenames) {
    const sourcePath = resolve(villainsDirectory, filename);

    if (await syncVillainTranslation(sourcePath)) {
      synchronized += 1;
    }
  }

  console.log(
    `Finished: ${synchronized}/${filenames.length} translations available`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Translation sync failed: ${message}`);
  process.exitCode = 1;
});
