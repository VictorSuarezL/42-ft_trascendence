import { Router } from 'express';
import multer from 'multer';
import { resolve } from 'node:path';
import {
  deleteCurrentUser,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  getNotifications,
  getUsers,
  getUserByLogin,
  loginUser,
  sendFriendRequest,
  markMessageNotificationRead,
  rejectFriendRequest,
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
router.get('/friends', getFriends);
router.post('/login', loginUser);
router.patch('/me', upload.single('image'), updateCurrentUser);
router.delete('/me', deleteCurrentUser);
router.get('/friend-requests', getFriendRequests);
router.get('/notifications', getNotifications);
router.post('/notifications/:id/read', markMessageNotificationRead);
router.post('/friend-requests/:id/accept', acceptFriendRequest);
router.post('/friend-requests/:id/reject', rejectFriendRequest);
router.post('/:login/friend-request', sendFriendRequest);
router.get('/:login', getUserByLogin);

export default router;
