import { PrismaClient, TaskPriority } from '@prisma/client';
import { io } from '../index.js'; 

const prisma = new PrismaClient();

interface CreateTaskInput {
  description: string;
  priority?: TaskPriority;
  requiredSkillId?: string;
}

export const getAllTasks = async (factoryId: string) => {
  return await prisma.task.findMany({
    where: { 
      factoryId: factoryId 
    },
    include: {
      requiredSkill: true,
      assignedWorker: true,
    },
    orderBy: {
      priority: 'desc',
    },
  });
};

export const createTask = async (taskData: CreateTaskInput, factoryId: string) => {
  const newTask = await prisma.task.create({
    data: {
      description: taskData.description,
      priority: taskData.priority,
      requiredSkillId: taskData.requiredSkillId,
      factoryId: factoryId,
    },
  });

  io.emit('task:create', newTask);
  console.log(`📢 Emitted task:create for new Task ID: ${newTask.id}`);

  return newTask;
};

export const assignTaskToWorker = async (taskId: string, workerId: string, factoryId: string) => {
  const [updatedTask, updatedWorker] = await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
        where: { id: taskId, factoryId: factoryId }
    });
    if (!task) {
        throw new Error("Task not found or you do not have permission to access it.");
    }

     const worker = await tx.worker.findFirst({
        where: { id: workerId, factoryId: factoryId }
    });
    if (!worker) {
        throw new Error("Worker not found or you do not have permission to assign them.");
    }

    const newUpdatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        assignedWorkerId: workerId,
        status: 'IN_PROGRESS',
      },
      include: { assignedWorker: true, requiredSkill: true } 
    });
    
    const newUpdatedWorker = await tx.worker.update({
      where: { id: workerId },
      data: {
        status: 'ON_TASK',
      },
    });

    return [newUpdatedTask, newUpdatedWorker];
  });

  io.emit('task:update', updatedTask);
  io.emit('worker:update', updatedWorker);
  console.log(`📢 Emitted task:update and worker:update for Task ID: ${updatedTask.id}`);

  return updatedTask;
};