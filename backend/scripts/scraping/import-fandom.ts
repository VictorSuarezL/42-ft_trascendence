import { getFandomPage } from './fandom.client';
import {
  createSlug,
  normalizeFandomPage,
  normalizeCardPage,
} from './normalize';
import { downloadImageAsWebp } from './images';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import type { StoredImage } from './images';
import type {
  Deck,
  DeckCard,
  NormalizedCard,
  VillainImageId,
  VillainImageReference,
} from './normalize';

type ImportedVillainImage = StoredImage & {
  id: VillainImageId;
};

const villainImageFileNames: Record<VillainImageId, string> = {
  portrait: 'portrait',
  mover: 'mover',
  realm: 'realm',
  villainDeckBack: 'villain-deck-back',
  fateDeckBack: 'fate-deck-back',
};

type ImportedCard = DeckCard &
  Omit<NormalizedCard, 'imageName' | 'imageSourceUrl'> & {
    image: StoredImage | null;
  };

type DeckName = 'villain' | 'fate';

interface ImportedDeck {
  totalCards: number;
  cards: ImportedCard[];
}

async function importDeckCards(
  deck: Deck,
  villainId: string,
  deckName: DeckName,
): Promise<ImportedDeck> {
  const cards: ImportedCard[] = [];

  for (const [index, reference] of deck.cards.entries()) {
    console.log(
      `Importing card ${index + 1}/${deck.cards.length}: ` +
        reference.pageTitle,
    );

    const cardPage = await getFandomPage(reference.pageTitle);

    const details = normalizeCardPage(cardPage);

    let image: StoredImage | null = null;

    if (details.imageName && details.imageSourceUrl) {
      image = await downloadImageAsWebp({
        sourceUrl: details.imageSourceUrl,
        sourceName: details.imageName,
        relativePath:
          `${villainId}/cards/${deckName}/` +
          `${createSlug(details.name)}.webp`,
      });
    } else {
      console.warn(`Image was not found for "${details.name}"`);
    }

    if (details.name !== reference.name) {
      console.warn(
        `Card name differs: deck="${reference.name}", ` +
          `page="${details.name}"`,
      );
    }

    const {
      imageName: _imageName,
      imageSourceUrl: _imageSourceUrl,
      ...cardDetails
    } = details;

    cards.push({
      ...reference,
      ...cardDetails,
      image,
    });
  }

  return {
    totalCards: deck.totalCards,
    cards,
  };
}

async function importVillainImages(
  references: VillainImageReference[],
  villainId: string,
): Promise<ImportedVillainImage[]> {
  const images: ImportedVillainImage[] = [];

  for (const reference of references) {
    console.log(`Importing villain image: ${reference.id}`);

    const filename = villainImageFileNames[reference.id];

    const storedImage = await downloadImageAsWebp({
      sourceUrl: reference.sourceUrl,
      sourceName: reference.sourceName,
      relativePath: `${villainId}/` + `${villainId}-${filename}.webp`,
      maxWidth: reference.id === 'realm' ? 1800 : 1000,
    });

    images.push({
      id: reference.id,
      ...storedImage,
    });
  }

  return images;
}

async function saveGeneratedJson(
  villainId: string,
  data: unknown,
): Promise<string> {
  const outputPath = resolve(
    process.cwd(),
    'json',
    'villains',
    `${villainId}.json`,
  );

  const temporaryPath = `${outputPath}.tmp`;

  await mkdir(dirname(outputPath), {
    recursive: true,
  });

  const content = JSON.stringify(data, null, 2) + '\n';

  await writeFile(temporaryPath, content, 'utf8');

  await rename(temporaryPath, outputPath);

  return outputPath;
}

async function main(): Promise<void> {
  const title = process.argv.slice(2).join(' ').trim();

  if (!title) {
    throw new Error('Usage: npm run import:fandom -- <page title>');
  }

  const page = await getFandomPage(title);

  console.log(`Page: ${page.title}`);
  console.log(`Page ID: ${page.pageId}`);
  console.log(`Images: ${page.images.length}`);

  const normalized = normalizeFandomPage(page);

  const villainImages = await importVillainImages(
    normalized.images,
    normalized.id,
  );

  const villainDeck = await importDeckCards(
    normalized.decks.villain,
    normalized.id,
    'villain',
  );

  const fateDeck = await importDeckCards(
    normalized.decks.fate,
    normalized.id,
    'fate',
  );

  const result = {
    ...normalized,
    images: villainImages,
    decks: {
      villain: villainDeck,
      fate: fateDeck,
    },
  };

  const outputPath = await saveGeneratedJson(normalized.id, result);

  console.log(`Generated JSON saved to: ${outputPath}`);

  // console.dir(result, {
  //   depth: null,
  // });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Import failed: ${message}`);
  process.exitCode = 1;
});
