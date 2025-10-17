import { Router } from 'express';
import { 
  handleVerifyInvite, 
  handleAcceptInvite 
} from '../controllers/invite.controller.js';

const router = Router();
router.get('/verify/:token', handleVerifyInvite);
router.post('/accept', handleAcceptInvite);

export default router;