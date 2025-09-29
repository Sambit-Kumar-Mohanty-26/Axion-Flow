import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as taskService from '../services/task.service.js';
import * as aiService from '../services/ai.service.js';

const prisma = new PrismaClient();

export const handleGetAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

export const handleCreateTask = async (req: Request, res: Response) => {
  const { description, priority, requiredSkillId } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Task description is required' });
  }

  try {
    const newTask = await taskService.createTask({
      description,
      priority,
      requiredSkillId,
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const handleFindRecommendationAndAssign = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const availableWorkers = await prisma.worker.findMany({
      where: { status: 'AVAILABLE' },
      include: { skills: { include: { skill: true } } },
    });

    const recommendation = await aiService.getRecommendationFromAI(task, availableWorkers);

    if (!recommendation || !recommendation.recommended_worker_id) {
      return res.status(404).json({ message: 'AI service could not find a suitable worker.' });
    }

    const assignedTask = await taskService.assignTaskToWorker(
      taskId,
      recommendation.recommended_worker_id
    );

    res.status(200).json({
      message: `Task successfully assigned to ${recommendation.worker_name}`,
      task: assignedTask,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error during recommendation and assignment process', error });
  }
};