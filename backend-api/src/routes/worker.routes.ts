import { Router } from 'express';
import { 
  handleGetAllWorkers, 
  handleCreateWorker, 
  handleBulkImport,
  handleUpdateWorkerStatus,
  handleAddSkillToWorker,
  handleSafetyCheck  
} from '../controllers/worker.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authorize('ORG_ADMIN', 'FACTORY_MANAGER', 'WORKER'), handleGetAllWorkers);

router.put('/:id/status', authorize('ORG_ADMIN', 'FACTORY_MANAGER', 'WORKER'), handleUpdateWorkerStatus);
router.post('/:id/safety-check', authorize('ORG_ADMIN', 'FACTORY_MANAGER', 'WORKER'), handleSafetyCheck);

router.post('/', authorize('ORG_ADMIN', 'FACTORY_MANAGER'), handleCreateWorker);
router.post('/bulk-import', authorize('ORG_ADMIN', 'FACTORY_MANAGER'), handleBulkImport);
router.post('/:id/skills', authorize('ORG_ADMIN', 'FACTORY_MANAGER'), handleAddSkillToWorker);

export default router;