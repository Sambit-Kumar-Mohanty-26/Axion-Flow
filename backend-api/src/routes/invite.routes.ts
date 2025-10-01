import { Router } from 'express';
import { 
  handleCreateInvite, 
  handleVerifyInvite, 
  handleAcceptInvite 
} from '../controllers/invite.controller.js';

const router = Router();

router.get('/verify/:token', handleVerifyInvite);
router.post('/accept', handleAcceptInvite);

router.post('/', handleCreateInvite);

export default router;