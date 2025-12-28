import { Router } from 'express';
import { 
  handleGetAllWorkers, 
  handleCreateWorker, 
  handleBulkImport,
  handleUpdateWorkerStatus,
  handleAddSkillToWorker 
} from '../controllers/worker.controller.js';

const router = Router();
router.get('/', handleGetAllWorkers);
router.post('/', handleCreateWorker);
router.post('/bulk-import', handleBulkImport);
router.put('/:id/status', handleUpdateWorkerStatus);
router.post('/:id/skills', handleAddSkillToWorker);

export default router;