import { Router } from 'express';
import { handleGetAlerts, handleMarkRead } from '../controllers/alert.controller.js';

const router = Router();
router.get('/', handleGetAlerts);
router.put('/read-all', handleMarkRead);

export default router;