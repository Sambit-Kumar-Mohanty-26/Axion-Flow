import { PrismaClient, TaskPriority } from '@prisma/client';
import { io } from '../index.js';

const prisma = new PrismaClient();

interface CreateTaskInput {
  description: string;
  priority?: TaskPriority;
  requiredSkillId?: string;
  location_x?: number;
  location_y?: number;
}

export const getAllTasks = async (factoryId: string) => {
  return await prisma.task.findMany({
    where: { factoryId },
    include: {
      requiredSkill: true,
      workers: true,
    },
    orderBy: { priority: 'desc' },
  });
};

export const createTask = async (taskData: CreateTaskInput, factoryId: string) => {
  const newTask = await prisma.task.create({
    data: {
      description: taskData.description,
      priority: taskData.priority,
      requiredSkillId: taskData.requiredSkillId,
      factoryId: factoryId,
      location_x: taskData.location_x ?? 50.0,
      location_y: taskData.location_y ?? 50.0,
      progress: 0,
      status: 'PENDING'
    },
    include: { workers: true, requiredSkill: true }
  });

  io.emit('task:create', newTask);
  console.log(`📢 Emitted task:create for new Task ID: ${newTask.id}`);
  return newTask;
};

export const assignTaskToWorker = async (taskId: string, workerId: string, factoryId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id: taskId, factoryId } });
    if (!task) throw new Error("Task not found or permission denied.");

    const worker = await tx.worker.findFirst({ where: { id: workerId, factoryId } });
    if (!worker) throw new Error("Worker not found or permission denied.");

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        workers: {
            connect: { id: workerId }
        }
      },
      include: { workers: true, requiredSkill: true } 
    });
    
    const updatedWorker = await tx.worker.update({
      where: { id: workerId },
      data: { status: 'ON_TASK' },
    });

    return { updatedTask, updatedWorker };
  });

  io.emit('task:update', result.updatedTask);
  io.emit('worker:update', result.updatedWorker);
  console.log(`📢 Assigned Worker ${workerId} to Task ${taskId}`);
  
  return result.updatedTask;
};

export const deleteTask = async (taskId: string, factoryId: string) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, factoryId } });
  if (!task) throw new Error("Task not found.");

  await prisma.task.delete({ where: { id: taskId } });
  io.emit('task:delete', { id: taskId });
  return { message: "Task deleted" };
};

export const updateTaskStatus = async (taskId: string, status: string, factoryId: string) => {
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status: status as any },
        include: { workers: true }
    });
    io.emit('task:update', updatedTask);
    return updatedTask;
}