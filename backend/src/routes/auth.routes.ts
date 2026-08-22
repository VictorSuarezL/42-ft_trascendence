import { Router } from 'express';

import {
  loginWithFortyTwo,
  fortyTwoCallback,
  getCurrentUser,
  logout,
} from '../controllers/auth.controller';

const router = Router();

router.get('/42', loginWithFortyTwo);
router.get('/42/callback', fortyTwoCallback);

router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
