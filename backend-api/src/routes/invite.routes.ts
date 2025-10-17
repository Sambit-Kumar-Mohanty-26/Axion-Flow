import { Router } from 'express';
import { handleCreateInvite } from '../controllers/invite.controller.js';
const router = Router();
router.post('/', handleCreateInvite);
export default router;