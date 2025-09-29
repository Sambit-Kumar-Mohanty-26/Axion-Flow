import { Router } from 'express';
import {
  handleCreateTask,
  handleGetAllTasks,
} from '../controllers/task.controller.js';

const router = Router();

router.get('/', handleGetAllTasks);
router.post('/', handleCreateTask);

export default router;