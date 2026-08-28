import { readFile, readdir } from 'node:fs/promises';
import { prisma } from '../utils/prisma';

interface VillainImageFile {
  id: string;
  path: string;
  width: number;
  height: number;
  mimeType: string;
  sourcePage?: string;
  sourceUrl?: string;
}

interface CardTranslationFile {
  name: string;
  text: string;
}

interface VillainTranslationFile {
  name: string;
  objective: string;
  locations: Record<string, string>;
  cards: Record<string, CardTranslationFile>;
}

interface RealmActionFile {
  type: string;
  amount?: number;
}

interface RealmLocationFile {
  id: string;
  position: number;
  topActions: RealmActionFile[];
  bottomActions: RealmActionFile[];
}

interface CardFile {
  id: string;
  quantity: number;
  type: string;
  cost: number | null;
  strength: number | null;
  image: CardImageFile;
}

interface DeckFile {
  totalCards: number;
  cards: CardFile[];
}

interface CardImageFile {
  path: string;
}

interface VillainFile {
  id: string;
  translations: Record<string, VillainTranslationFile>;
  images: VillainImageFile[];
  realm: RealmLocationFile[];
  decks: Record<string, DeckFile>;
}

async function main() {
  const directoryUrl = new URL('../../json/villains/', import.meta.url);

  const files = await readdir(directoryUrl);

  const jsonFiles = files.filter((file) => file.endsWith('.json')).sort();

  for (const file of jsonFiles) {
    const fileUrl = new URL(file, directoryUrl);
    const content = await readFile(fileUrl, 'utf-8');
    const data = JSON.parse(content) as VillainFile;

    console.log(`Importing villain from: ${file}`);

    const villain = await prisma.villain.upsert({
      where: { id: data.id },
      update: {},
      create: { id: data.id },
    });

    for (const [deckId, deck] of Object.entries(data.decks)) {
      await prisma.deck.upsert({
        where: {
          villainId_id: {
            villainId: data.id,
            id: deckId,
          },
        },
        update: {},
        create: {
          villainId: data.id,
          id: deckId,
        },
      });

      console.log(`Deck imported: ${data.id}/${deckId}`);

      for (const card of deck.cards) {
        const cardData = {
          quantity: card.quantity,
          type: card.type,
          cost: card.cost,
          strength: card.strength,
          imagePath: card.image.path,
        };

        await prisma.card.upsert({
          where: {
            villainId_deckId_id: {
              villainId: data.id,
              deckId,
              id: card.id,
            },
          },
          update: cardData,
          create: {
            villainId: data.id,
            deckId,
            id: card.id,
            ...cardData,
          },
        });

        console.log(`Card imported: ${data.id}/${deckId}/${card.id}`);

        for (const [language, translation] of Object.entries(
          data.translations,
        )) {
          const cardTranslation = translation.cards[card.id];

          if (!cardTranslation) {
            throw new Error(
              `Card translation missing: ${data.id}/${card.id}/${language}`,
            );
          }

          await prisma.cardTranslation.upsert({
            where: {
              villainId_deckId_cardId_language: {
                villainId: data.id,
                deckId,
                cardId: card.id,
                language,
              },
            },
            update: {
              name: cardTranslation.name,
              text: cardTranslation.text,
            },
            create: {
              villainId: data.id,
              deckId,
              cardId: card.id,
              language,
              name: cardTranslation.name,
              text: cardTranslation.text,
            },
          });

          console.log(`Card translation imported: ${card.id}/${language}`);
        }
      }
    }

    console.log('Villain imported:', villain);

    for (const [language, translation] of Object.entries(data.translations)) {
      await prisma.villainTranslation.upsert({
        where: {
          villainId_language: {
            villainId: data.id,
            language,
          },
        },
        update: {
          name: translation.name,
          objective: translation.objective,
        },
        create: {
          villainId: data.id,
          language,
          name: translation.name,
          objective: translation.objective,
        },
      });

      console.log(`Translation imported: ${language}`);
    }

    for (const image of data.images) {
      const imageData = {
        path: image.path,
        width: image.width,
        height: image.height,
        mimeType: image.mimeType,
        sourcePage: image.sourcePage ?? null,
        sourceUrl: image.sourceUrl ?? null,
      };

      await prisma.villainImage.upsert({
        where: {
          villainId_id: {
            villainId: data.id,
            id: image.id,
          },
        },
        update: imageData,
        create: {
          villainId: data.id,
          id: image.id,
          ...imageData,
        },
      });

      console.log(`Image imported: ${image.id}`);
    }

    for (const location of data.realm) {
      await prisma.realmLocation.upsert({
        where: {
          villainId_id: {
            villainId: data.id,
            id: location.id,
          },
        },
        update: {
          position: location.position,
        },
        create: {
          villainId: data.id,
          id: location.id,
          position: location.position,
        },
      });

      console.log(`Realm location imported: ${location.id}`);

      for (const [index, action] of location.topActions.entries()) {
        const position = index + 1;

        await prisma.realmAction.upsert({
          where: {
            villainId_locationId_area_position: {
              villainId: data.id,
              locationId: location.id,
              area: 'TOP',
              position,
            },
          },
          update: {
            type: action.type,
            amount: action.amount ?? null,
          },
          create: {
            villainId: data.id,
            locationId: location.id,
            area: 'TOP',
            position,
            type: action.type,
            amount: action.amount ?? null,
          },
        });

        console.log(
          `Top action imported: ${location.id}/${position}/${action.type}`,
        );
      }

      for (const [index, action] of location.bottomActions.entries()) {
        const position = index + 1;

        await prisma.realmAction.upsert({
          where: {
            villainId_locationId_area_position: {
              villainId: data.id,
              locationId: location.id,
              area: 'BOTTOM',
              position,
            },
          },
          update: {
            type: action.type,
            amount: action.amount ?? null,
          },
          create: {
            villainId: data.id,
            locationId: location.id,
            area: 'BOTTOM',
            position,
            type: action.type,
            amount: action.amount ?? null,
          },
        });

        console.log(
          `Bottom action imported: ${location.id}/${position}/${action.type}`,
        );
      }

      for (const [language, translation] of Object.entries(data.translations)) {
        const locationName = translation.locations[location.id];

        if (!locationName) {
          throw new Error(
            `Translation missing: ${data.id}/${location.id}/${language}`,
          );
        }

        await prisma.realmLocationTranslation.upsert({
          where: {
            villainId_locationId_language: {
              villainId: data.id,
              locationId: location.id,
              language,
            },
          },
          update: {
            name: locationName,
          },
          create: {
            villainId: data.id,
            locationId: location.id,
            language,
            name: locationName,
          },
        });

        console.log(
          `Location translation imported: ${location.id}/${language}`,
        );
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
