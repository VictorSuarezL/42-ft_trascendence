import { Router } from 'express';
import { createUser } from '../controllers/signup.controller';

const router = Router();

router.post('/', createUser);

export default router;
