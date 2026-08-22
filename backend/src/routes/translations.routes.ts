import { Router } from 'express';
import { getTranslations } from '../controllers/translations.controller';

const router = Router();

router.get('/:language', getTranslations);

export default router;
