import { Router } from 'express';

import { getUsers, loginUser } from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);
router.post('/login', loginUser);

export default router;
