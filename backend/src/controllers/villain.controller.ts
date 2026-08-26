import type { Request, Response } from 'express';
import type {
  Villain,
  VillainResponse,
  VillainModelContract,
} from '../types/villains.types';

function getRequestedLanguage(query: Request['query']): string {
  return typeof query.lang === 'string' ? query.lang.toLowerCase() : 'en';
}

export class VillainController {
  constructor(private villainModel: VillainModelContract) {}

  getById = async (req: Request<{ villainId: string }>, res: Response) => {
    const villainId = req.params.villainId.toLowerCase();
    const language = getRequestedLanguage(req.query);

    const villain = await this.villainModel.getById(villainId);

    if (!villain) {
      return res.status(404).json({
        message: `Villain "${villainId}" not found`,
      });
    }

    const translation = villain.translations[language];

    if (!translation) {
      return res.status(400).json({
        message: `Language "${language}" is not supported`,
        availableLanguages: Object.keys(villain.translations),
      });
    }

    const result: VillainResponse = {
      id: villain.id,
      name: villain.name,
      images: villain.images,
      translation: translation,
    };

    return res.json(result);
  };

  getAll = async (req: Request, res: Response) => {
    const language = getRequestedLanguage(req.query);
    const villains: Villain[] = await this.villainModel.getAll();

    const result: VillainResponse[] = villains.map((villain) => ({
      id: villain.id,
      name: villain.name,
      images: villain.images,
      translation: villain.translations[language],
    }));

    return res.json(result);
  };
}
