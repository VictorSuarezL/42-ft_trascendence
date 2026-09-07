import { Router } from 'express';
import { TranslationsController } from '../controllers/translations.controller';
import type { TranslationModelContract } from '../types/translations.types';

export const createTranslationsRouter = (
  translationsModel: TranslationModelContract,
) => {
  const translationsRouter = Router();
  const translationsController = new TranslationsController(translationsModel);

  translationsRouter.get('/:language', translationsController.getTranslations);

  return translationsRouter;
};
