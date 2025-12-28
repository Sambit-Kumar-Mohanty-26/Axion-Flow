import { Router } from 'express';
import { 
  handleCreateTask, 
  handleGetAllTasks,
  handleFindRecommendationAndAssign,
  handleDeleteTask, 
  handleUpdateTaskStatus
} from '../controllers/task.controller.js';

const router = Router();

router.get('/', handleGetAllTasks);
router.post('/', handleCreateTask);
router.post('/:taskId/assign-recommended', handleFindRecommendationAndAssign);
router.delete('/:taskId', handleDeleteTask);
router.patch('/:taskId/status', handleUpdateTaskStatus);

export default router;