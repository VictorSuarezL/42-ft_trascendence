import { prisma } from '../../utils/prisma';
import type {
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
          orderBy: {
            position: 'asc',
          },
          include: {
            actions: {
              orderBy: [{ area: 'asc' }, { position: 'asc' }],
            },
            translations: {
              where: { language },
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

    return {
      id: villain.id,
      name: villain.translations[0].name,
      objective: villain.translations[0].objective,
      images: villain.images,
      realm,
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
