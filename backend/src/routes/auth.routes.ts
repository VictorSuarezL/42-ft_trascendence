import { Router } from 'express';

import {
  loginWithFortyTwo,
  fortyTwoCallback,
  getCurrentUser,
  logout,
  confirmEmail,
  resetPassword,
  forgotPassword,
} from '../controllers/auth.controller';

const router = Router();

router.get('/42', loginWithFortyTwo);
router.get('/42/callback', fortyTwoCallback);

router.get('/me', getCurrentUser);
router.post('/confirm-email', confirmEmail);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/logout', logout);

export default router;
