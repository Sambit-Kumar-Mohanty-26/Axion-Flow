import { Router } from 'express';
import { handleGetReplayData, handleGetHeatmap } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/replay', handleGetReplayData);
router.get('/heatmap', handleGetHeatmap);

export default router;