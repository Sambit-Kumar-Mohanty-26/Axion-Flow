import { PrismaClient, Role } from '@prisma/client';
import { io } from '../index.js';

const prisma = new PrismaClient();

export const getAllWorkers = async (factoryId: string) => {
  return await prisma.worker.findMany({
    where: { 
      factoryId: factoryId 
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: {
      name: 'asc'
    }
  });
};

export const createWorker = async (
  name: string,
  skills: { skillId: string; proficiency: number }[],
  factoryId: string
) => {
  const newWorker = await prisma.worker.create({
    data: {
      name,
      factoryId,
      skills: {
        create: skills.map((skill) => ({
          skillId: skill.skillId,
          proficiency: skill.proficiency,
        })),
      },
    },
    include: {
      skills: { include: { skill: true } },
    },
  });

  io.emit('worker:create', newWorker);
  console.log(`📢 Emitted worker:create for Worker ID: ${newWorker.id}`);
  
  return newWorker;
};

export const updateWorkerStatus = async (workerId: string, status: 'AVAILABLE' | 'ON_TASK' | 'ON_BREAK' | 'ABSENT', factoryId: string) => {
  const worker = await prisma.worker.findFirst({ 
    where: { id: workerId, factoryId }
  });

  if (!worker) {
    throw new Error("Worker not found in this factory or permission denied.");
  }

  const updatedWorker = await prisma.worker.update({
    where: { id: workerId },
    data: { status },
    include: { skills: { include: { skill: true } } }
  });

  io.emit('worker:update', updatedWorker);
  console.log(`📢 Emitted worker:update for Worker ID: ${workerId} -> ${status}`);

  return updatedWorker;
};

export const addSkillToWorker = async (workerId: string, skillId: string, proficiency: number, factoryId: string) => {
  const worker = await prisma.worker.findFirst({
    where: { id: workerId, factoryId }
  });
  if (!worker) throw new Error("Worker not found in this factory.");

  await prisma.workerSkill.upsert({
    where: {
      workerId_skillId: {
        workerId,
        skillId
      }
    },
    update: { proficiency },
    create: {
      workerId,
      skillId,
      proficiency
    }
  });

  const updatedWorker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { skills: { include: { skill: true } } }
  });

  if (updatedWorker) {
    io.emit('worker:update', updatedWorker);
    console.log(`📢 Emitted worker:update (Skill Added) for Worker ID: ${workerId}`);
  }

  return updatedWorker;
};

export const bulkImportWorkers = async (
  workers: { name: string; employeeId: string }[],
  factoryId: string,
  organizationId: string
) => {
  const result = await prisma.$transaction(async (tx) => {
    const createdWorkers = [];
    for (const workerData of workers) {
      
      const user = await tx.user.create({
        data: {
          email: `${workerData.employeeId}.${factoryId}@axion-staged.local`, 
          passwordHash: null, 
          role: Role.WORKER,
          status: 'PENDING',
          factoryId: factoryId,
          organizationId: organizationId,
        },
      });

      const worker = await tx.worker.create({
        data: {
          name: workerData.name,
          employeeId: workerData.employeeId,
          factoryId: factoryId,
          userId: user.id,
        },
      });

      createdWorkers.push(worker);
    }
    return createdWorkers;
  });

  io.emit('workers:bulk-update', { factoryId, count: result.length });
  console.log(`📢 Emitted workers:bulk-update for Factory ID: ${factoryId}`);

  return result;
};

export const recordSafetyCheck = async (workerId: string, factoryId: string) => {
  const worker = await prisma.worker.findFirst({ where: { id: workerId, factoryId } });
  if (!worker) throw new Error("Worker not found.");

  const updatedWorker = await prisma.worker.update({
    where: { id: workerId },
    data: { lastSafetyCheck: new Date() }
  });

  io.emit('worker:update', updatedWorker);
  return updatedWorker;
};