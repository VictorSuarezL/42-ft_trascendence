import { prisma } from '../../utils/prisma';
import { CardDetail  } from '../../types/villains.types';

export class CardPrismaModel {
  static async getById(
    id: string,
    language: string,
  ): Promise<CardDetail | null> {
    const card = await prisma.card.findUnique({
      where: {
        id,
      },
      include: {
        translations: {
          where: {
            language,
          },
        },
        deck: true,
      },
    });

    if (!card) {
      return null;
    }

    const translation = card.translations[0];

    if (!translation) {
      throw new Error(`Translation "${language}" not found for card "${id}"`);
    }

    return {
      id: card.id,
      villainId: card.villainId,
      quantity: card.quantity,
      type: card.type,
      cost: card.cost,
      strength: card.strength,
      imagePath: card.imagePath,
      name: translation.name,
      text: translation.text,

      deck: {
        type: card.deck.type,
        backImagePath: card.deck.backImagePath,
        bottomPowerImagePath: card.deck.bottomPowerImagePath,
        bottomPowerlessImagePath: card.deck.bottomPowerlessImagePath,
      },
    };
  }
}