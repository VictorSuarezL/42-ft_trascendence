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
              orderBy: [
                { area: 'asc' },
                { position: 'asc' },
              ],
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

    const translation = villain.translations[0];

    if (!translation) {
      throw new Error(`Translation "${language}" not found for "${id}"`);
    }

    const realm: RealmLocation[] = villain.realmLocations.map((location) => {
      const locationTranslation = location.translations[0];

      if (!locationTranslation) {
        throw new Error(
          `Translation "${language}" not found for location ` +
            `"${location.id}"`,
        );
      }

      return {
        id: location.id,
        name: locationTranslation.name,
        position: location.position,
        actions: location.actions,
      };
    });

    return {
      id: villain.id,
      name: translation.name,
      objective: translation.objective,
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
