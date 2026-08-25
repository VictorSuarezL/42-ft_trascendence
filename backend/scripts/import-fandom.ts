import { getFandomPage } from './fandom.client';
import { normalizeFandomPage, normalizeCardPage } from './normalize';
import type { Deck, DeckCard, NormalizedCard } from './normalize';

type ImportedCard = DeckCard & NormalizedCard;

interface ImportedDeck {
  totalCards: number;
  cards: ImportedCard[];
}

async function importDeckCards(deck: Deck): Promise<ImportedDeck> {
  const cards: ImportedCard[] = [];

  for (const [index, reference] of deck.cards.entries()) {
    console.log(
      `Importing card ${index + 1}/${deck.cards.length}: ` +
        reference.pageTitle,
    );

    const cardPage = await getFandomPage(reference.pageTitle);

    const details = normalizeCardPage(cardPage);

    if (details.name !== reference.name) {
      console.warn(
        `Card name differs: deck="${reference.name}", ` +
          `page="${details.name}"`,
      );
    }

    cards.push({
      ...reference,
      ...details,
    });
  }

  return {
    totalCards: deck.totalCards,
    cards,
  };
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

  const villainDeck = await importDeckCards(normalized.decks.villain);

  const fateDeck = await importDeckCards(normalized.decks.fate);

  const result = {
    ...normalized,
    decks: {
      villain: villainDeck,
      fate: fateDeck,
    },
  };

  console.dir(result, {
    depth: null,
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Import failed: ${message}`);
  process.exitCode = 1;
});
