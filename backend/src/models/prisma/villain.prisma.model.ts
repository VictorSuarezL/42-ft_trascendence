import { prisma } from '../../utils/prisma';
import type {
  Deck,
  RealmLocation,
  Villain,
  VillainDetail,
} from '../../types/villains.types';

export class VillainPrismaModel {
  static async getById(
    id: string,
    language: string,
  ): Promise<VillainDetail | null> {
    const villain = await prisma.villain.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
        images: true,
        realmLocations: {
          include: {
            actions: true,
            translations: { where: { language } },
          },
        },
        decks: {
          include: {
            cards: {
              include: {
                translations: {
                  where: { language },
                },
              },
            },
          },
        },
      },
    });

    if (!villain) {
      return null;
    }

    const realm: RealmLocation[] = villain.realmLocations.map((location) => {
      return {
        id: location.id,
        name: location.translations[0].name,
        position: location.position,
        actions: location.actions,
      };
    });

    const decks: Deck[] = villain.decks.map((deck) => ({
      type: deck.type,
      backImagePath: deck.backImagePath,
      bottomPowerImagePath: deck.bottomPowerImagePath,
      bottomPowerlessImagePath: deck.bottomPowerlessImagePath,

      cards: deck.cards.map((card) => {
        const translation = card.translations[0];

        if (!translation) {
          throw new Error(
            `Translation "${language}" not found for card "${card.id}"`,
          );
        }

        return {
          id: card.id,
          quantity: card.quantity,
          type: card.type,
          cost: card.cost,
          strength: card.strength,
          imagePath: card.imagePath,
          name: translation.name,
          text: translation.text,
        };
      }),
    }));

    return {
      id: villain.id,
      name: villain.translations[0].name,
      objective: villain.translations[0].objective,
      images: villain.images,
      realm,
      decks,
    };
  }

  static async getAll(language: string): Promise<Villain[]> {
    const villains = await prisma.villain.findMany({
      include: {
        translations: {
          where: { language },
        },
        images: true,
      },
    });

    return villains.map((villain) => {
      const translation = villain.translations[0];

      if (!translation) {
        throw new Error(
          `Translation "${language}" not found for "${villain.id}"`,
        );
      }

      return {
        id: villain.id,
        name: translation.name,
        objective: translation.objective,
        images: villain.images,
      };
    });
  }
}
