import { Router } from 'express';
import multer from 'multer';
import { resolve } from 'node:path';
import {
  getUsers,
  loginUser,
  updateCurrentUser,
} from '../controllers/user.controller';

const router = Router();

const uploadDir = resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get('/', getUsers);
router.post('/login', loginUser);
router.patch('/me', upload.single('image'), updateCurrentUser);

export default router;
