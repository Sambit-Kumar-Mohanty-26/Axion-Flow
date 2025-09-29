import { Router } from 'express';
import {
  handleCreateWorker,
  handleGetAllWorkers,
} from '../controllers/worker.controller.js';

const router = Router();

router.get('/', handleGetAllWorkers);
router.post('/', handleCreateWorker);

export default router;