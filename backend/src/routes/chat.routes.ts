import { Router } from 'express';
import {
  createOrGetConversation,
  getConversationMessages,
  getConversations,
  sendConversationMessage,
} from '../controllers/chat.controller';

const router = Router();

router.get('/', getConversations);
router.post('/with/:friendId', createOrGetConversation);
router.get('/:conversationId/messages', getConversationMessages);
router.post('/:conversationId/messages', sendConversationMessage);

export default router;
