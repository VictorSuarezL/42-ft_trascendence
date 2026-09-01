import type { Request, Response } from 'express';
import { Card } from '../types/villains.types';

export interface CardDeck {
  type: 'VILLAIN' | 'FATE';
  backImagePath: string;
  bottomPowerImagePath: string;
  bottomPowerlessImagePath: string;
}

export interface CardDetail extends Card {
  villainId: string;
  deck: CardDeck;
}

export interface CardModelContract {
  getById(id: string, language: string): Promise<CardDetail | null>;
}

type Language = 'en' | 'es';

function getRequestedLanguage(query: Request['query']): Language {
  if (typeof query.lang === 'string' && query.lang.toLowerCase() === 'es') {
    return 'es';
  }

  return 'en';
}

export class CardController {
  constructor(private cardModel: CardModelContract) {}

  getById = async (req: Request<{ cardId: string }>, res: Response) => {
    const cardId = req.params.cardId.toLowerCase();
    const language = getRequestedLanguage(req.query);

    const villain = await this.cardModel.getById(cardId, language);

    if (!villain) {
      return res.status(404).json({
        message: `Villain "${cardId}" not found`,
      });
    }

    return res.json(villain);
  };

  // getAll = async (req: Request, res: Response) => {
  //   const language = getRequestedLanguage(req.query);
  //   const villains: Villain[] = await this.cardModel.getAll(language);

  //   return res.json(villains);
  // };
}