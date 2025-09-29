import { Router } from 'express';
import { handleFindRecommendationAndAssign } from '../controllers/task.controller.js';
import {
  handleCreateTask,
  handleGetAllTasks,
} from '../controllers/task.controller.js';

const router = Router();

router.get('/', handleGetAllTasks);
router.post('/', handleCreateTask);
router.post('/:taskId/assign-recommended', handleFindRecommendationAndAssign);
export default router;