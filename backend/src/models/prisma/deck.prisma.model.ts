import { prisma } from '../../utils/prisma';

export class DeckPrismaModel {
  static async getByVillainId(villainId: string) {
    return prisma.deck.findMany({
      where: { villainId },
      select: {
        type: true,
        cards: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
    });
  }
}
