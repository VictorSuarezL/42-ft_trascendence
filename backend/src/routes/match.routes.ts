import { Router } from 'express';
import { getMyMatches, getMyRecentMatches } from '../controllers/match.controller';

const router = Router();

router.get('/', getMyMatches);
router.get('/recent', getMyRecentMatches);

export default router;
