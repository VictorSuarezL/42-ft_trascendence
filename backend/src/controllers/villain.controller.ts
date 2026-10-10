import type { Request, Response } from 'express';
import { getRequestedLanguage } from '../utils/language';
import type {
  Villain,
  VillainModelContract,
} from '../types/villains.types';

export class VillainController {
  constructor(private villainModel: VillainModelContract) {}

  getById = async (req: Request<{ villainId: string }>, res: Response) => {
    const villainId = req.params.villainId.toLowerCase();
    const language = getRequestedLanguage(req.query.lang);

    const villain = await this.villainModel.getById(villainId, language);

    if (!villain) {
      return res.status(404).json({
        message: `Villain "${villainId}" not found`,
      });
    }

    return res.json(villain);
  };

  getAll = async (req: Request, res: Response) => {
    const language = getRequestedLanguage(req.query.lang);
    const villains: Villain[] = await this.villainModel.getAll(language);

    return res.json(villains);
  };
}
