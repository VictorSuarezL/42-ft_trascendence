import type { Request, Response } from 'express';
import type { Translation, TranslationModelContract } from '../types/translations.types';

function buildTranslationObject(
  translations: { key: string; value: string }[],
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

export class TranslationsController {
  constructor(private translationsModel: TranslationModelContract) {}

  getTranslations = async (
    req: Request<{ language: string }>,
    res: Response,
  ) => {
    const { language } = req.params;
    const namespace = req.query.namespace;

    if (typeof namespace !== 'string') {
      const translations = await this.translationsModel.getByLanguage(language);

      return res.json(buildTranslationObject(translations));
    }

    const namespaces = namespace.split(',');
    const translations: Translation[] = [];

    for (const name of namespaces) {
      const group = await this.translationsModel.getByNamespace(
        name.trim(),
        language,
      );

      translations.push(...group);
    }

    return res.json(buildTranslationObject(translations));
  };
}
