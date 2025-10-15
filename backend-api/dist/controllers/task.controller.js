import {} from 'express';
import { PrismaClient } from '@prisma/client';
import * as taskService from '../services/task.service.js';
import * as aiService from '../services/ai.service.js';
import {} from '../middleware/auth.middleware.js';
const prisma = new PrismaClient();
export const handleGetAllTasks = async (req, res) => {
    const factoryId = req.user?.factoryId;
    if (!factoryId)
        return res.status(401).json({ message: 'Factory not found' });
    try {
        const tasks = await taskService.getAllTasks(factoryId);
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};
export const handleCreateTask = async (req, res) => {
    const { description, priority, requiredSkillId } = req.body;
    const factoryId = req.user?.factoryId;
    if (!factoryId)
        return res.status(401).json({ message: 'Factory not found' });
    if (!description) {
        return res.status(400).json({ message: 'Task description is required' });
    }
    try {
        const newTask = await taskService.createTask({ description, priority, requiredSkillId }, factoryId);
        res.status(201).json(newTask);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
};
export const handleFindRecommendationAndAssign = async (req, res) => {
    const { taskId } = req.params;
    const factoryId = req.user?.factoryId;
    if (!factoryId)
        return res.status(401).json({ message: 'Factory not found' });
    try {
        const task = await prisma.task.findFirst({ where: { id: taskId, factoryId } });
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const availableWorkers = await prisma.worker.findMany({
            where: { status: 'AVAILABLE', factoryId },
            include: { skills: { include: { skill: true } } },
        });
        const recommendation = await aiService.getRecommendationFromAI(task, availableWorkers);
        if (!recommendation || !recommendation.recommended_worker_id) {
            return res.status(404).json({ message: 'AI service could not find a suitable worker.' });
        }
        const assignedTask = await taskService.assignTaskToWorker(taskId, recommendation.recommended_worker_id, factoryId);
        res.status(200).json({
            message: `Task successfully assigned to ${recommendation.worker_name}`,
            task: assignedTask,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error during recommendation and assignment process', error });
    }
};
//# sourceMappingURL=task.controller.js.map