import { Router } from 'express';
import {
  handleCreateWorker,
  handleGetAllWorkers,
  handleBulkImport,
} from '../controllers/worker.controller.js';

const router = Router();

router.get('/', handleGetAllWorkers);
router.post('/', handleCreateWorker);
router.post('/bulk-import', handleBulkImport);

export default router;