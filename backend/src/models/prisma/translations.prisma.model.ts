import { prisma } from '../../utils/prisma';
import type { Translation } from '../../types/translations.types';

export class TranslationsPrismaModel {
  static async getByLanguage(language: string): Promise<Translation[]> {
    return prisma.translation.findMany({
      where: { language },
      select: {
        key: true,
        value: true,
      },
    });
  }
}
