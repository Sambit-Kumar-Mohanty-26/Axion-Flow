import { type Request, type Response } from 'express';
import * as taskService from '../services/task.service.js';

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