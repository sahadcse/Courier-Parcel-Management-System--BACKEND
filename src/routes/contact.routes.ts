import { Router } from 'express';
import { createMessage, getAllMessages } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', createMessage);
router.get('/', authMiddleware(['admin']), getAllMessages);

export default router;
