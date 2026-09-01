import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

function buildTranslationObject(
  translations: {
    key: string;
    value: string;
  }[],
) {
  const result: Record<string, any> = {};

  for (const translation of translations) {
    const parts = translation.key.split('.');

    let current = result;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = translation.value;
        return;
      }

      if (!current[part]) {
        current[part] = {};
      }

      current = current[part];
    });
  }

  return result;
}

export async function getTranslations(
  req: Request<{ language: string }>,
  res: Response,
) {
  const { language } = req.params;

  const translations = await prisma.translation.findMany({
    where: {
      language,
    },
    select: {
      key: true,
      value: true,
    },
  });

  const data = buildTranslationObject(translations);

  res.json(data);
}
