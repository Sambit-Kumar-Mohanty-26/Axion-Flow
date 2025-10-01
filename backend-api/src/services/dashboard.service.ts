import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getOrgAnalytics = async (organizationId: string) => {
  const [factoryCount, workerCount, totalTasks, completedTasks] = await prisma.$transaction([
    prisma.factory.count({ 
      where: { organizationId } 
    }),
    prisma.worker.count({ 
      where: { factory: { organizationId } } 
    }),
    prisma.task.count({ 
      where: { factory: { organizationId } } 
    }),
    prisma.task.count({ 
      where: { 
        factory: { organizationId }, 
        status: 'COMPLETED' 
      } 
    })
  ]);

  return {
    factoryCount,
    workerCount,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
  };
};

export const getFactoryAnalytics = async (factoryId: string) => {
  const [activeWorkers, openTasks, totalTasks, completedTasks] = await prisma.$transaction([
    prisma.worker.count({ 
      where: { 
        factoryId, 
        status: { in: ['AVAILABLE', 'ON_TASK'] } 
      } 
    }),
    prisma.task.count({ 
      where: { 
        factoryId, 
        status: { not: 'COMPLETED' } 
      } 
    }),
    prisma.task.count({ where: { factoryId } }),
    prisma.task.count({ where: { factoryId, status: 'COMPLETED' } })
  ]);

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    activeWorkers,
    openTasks,
    completionRate,
  };
};