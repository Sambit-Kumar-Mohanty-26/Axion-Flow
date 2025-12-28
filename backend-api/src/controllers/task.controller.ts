import { type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as taskService from '../services/task.service.js';
import * as aiService from '../services/ai.service.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

export const handleGetAllTasks = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Factory not found in token' });

  try {
    const tasks = await taskService.getAllTasks(factoryId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

export const handleCreateTask = async (req: AuthRequest, res: Response) => {
  const { description, priority, requiredSkillId, location_x, location_y } = req.body;
  const factoryId = req.user?.factoryId;
  
  if (!factoryId) return res.status(401).json({ message: 'Factory not found in token' });
  if (!description) return res.status(400).json({ message: 'Task description is required' });

  try {
    const newTask = await taskService.createTask({ 
      description, 
      priority, 
      requiredSkillId,
      location_x: location_x ? parseFloat(location_x) : 50,
      location_y: location_y ? parseFloat(location_y) : 50
    }, factoryId);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const handleFindRecommendationAndAssign = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const factoryId = req.user?.factoryId;
  
  if (!factoryId) return res.status(401).json({ message: 'Factory not found in token' });

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, factoryId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const availableWorkers = await prisma.worker.findMany({
      where: { status: 'AVAILABLE', factoryId },
      include: { skills: { include: { skill: true } } },
    });

    if (availableWorkers.length === 0) {
        return res.status(404).json({ message: 'No available workers found in this factory.' });
    }

    const recommendation = await aiService.getRecommendationFromAI(task, availableWorkers);

    if (!recommendation || !recommendation.recommended_worker_id) {
      return res.status(404).json({ message: 'AI could not find a suitable worker.' });
    }

    const assignedTask = await taskService.assignTaskToWorker(
      taskId,
      recommendation.recommended_worker_id,
      factoryId
    );

    res.status(200).json({
      message: `Task successfully assigned to ${recommendation.worker_name}`,
      task: assignedTask,
      aiDetails: {
      score: recommendation.score ?? 0, 
      confidence: ((recommendation.score ?? 0)* 100).toFixed(1) + '%'
      }
    });

  } catch (error: any) {
    console.error("Assignment Error:", error);
    res.status(500).json({ message: 'Error during recommendation and assignment process', error: error.message });
  }
};

export const handleDeleteTask = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await taskService.deleteTask(taskId, factoryId);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleUpdateTaskStatus = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const updatedTask = await taskService.updateTaskStatus(taskId, status, factoryId);
    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};