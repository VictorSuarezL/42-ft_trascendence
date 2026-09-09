import { prisma } from '../../utils/prisma';
import type { Translation } from '../../types/translations.types';

export class TranslationsPrismaModel {
  static async getByLanguage(language: string): Promise<Translation[]> {
    return prisma.translation.findMany({
      where: { language },
      select: { key: true, value: true },
    });
  }

  static async getByNamespace(
    namespace: string,
    language: string,
  ): Promise<Translation[]> {
    return prisma.translation.findMany({
      where: { language, key: { startsWith: `${namespace}.` } },
      select: { key: true, value: true },
    });
  }
}
