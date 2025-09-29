import { PrismaClient, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTaskInput {
  description: string;
  priority?: TaskPriority;
  requiredSkillId?: string;
}
export const getAllTasks = async () => {
  return await prisma.task.findMany({
    include: {
      requiredSkill: true,
      assignedWorker: true,
    },
    orderBy: {
      priority: 'desc', 
    },
  });
};

export const createTask = async (taskData: CreateTaskInput) => {
  return await prisma.task.create({
    data: {
      description: taskData.description,
      priority: taskData.priority,
      requiredSkillId: taskData.requiredSkillId,
    },
  });
};