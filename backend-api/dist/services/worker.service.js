import { PrismaClient, Role } from '@prisma/client';
import { io } from '../index.js';
const prisma = new PrismaClient();
export const getAllWorkers = async (factoryId) => {
    return await prisma.worker.findMany({ where: { factoryId }, include: { skills: { include: { skill: true } } } });
};
export const createWorker = async (name, skills, factoryId) => {
    const newWorker = await prisma.worker.create({
        data: { name, factoryId, skills: { create: skills.map(s => ({ ...s })) } },
        include: { skills: { include: { skill: true } } },
    });
    io.emit('worker:create', newWorker);
    return newWorker;
};
export const updateWorkerStatus = async (workerId, status, factoryId) => {
    const worker = await prisma.worker.findFirst({ where: { id: workerId, factoryId } });
    if (!worker) {
        throw new Error("Worker not found or permission denied.");
    }
    const updatedWorker = await prisma.worker.update({ where: { id: workerId }, data: { status } });
    io.emit('worker:update', updatedWorker);
    return updatedWorker;
};
export const bulkImportWorkers = async (workers, factoryId, organizationId) => {
    const result = await prisma.$transaction(async (tx) => {
        const createdWorkers = [];
        for (const workerData of workers) {
            const user = await tx.user.create({ data: { email: `${workerData.employeeId}.${factoryId}@axion-staged.local`, passwordHash: null, role: Role.WORKER, status: 'PENDING', factoryId, organizationId } });
            const worker = await tx.worker.create({ data: { name: workerData.name, employeeId: workerData.employeeId, factoryId, userId: user.id } });
            createdWorkers.push(worker);
        }
        return createdWorkers;
    });
    io.emit('workers:bulk-update', { factoryId, count: result.length });
    return result;
};
//# sourceMappingURL=worker.service.js.map