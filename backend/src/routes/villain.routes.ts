import { Router } from 'express';
import { VillainController } from '../controllers/villain.controller';
import type { VillainModelContract } from '../types/villains.types';

export const createVillainRouter = (villainModel: VillainModelContract) => {
  const villainRouter = Router();

  const villainController = new VillainController(villainModel);

  villainRouter.get('/', villainController.getAll);
  villainRouter.get('/:villainId', villainController.getById);

  return villainRouter;
};
