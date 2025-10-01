import { PrismaClient, TaskPriority } from '@prisma/client';
import { io } from '../index.js'; // Import the shared Socket.IO instance
const prisma = new PrismaClient();
/**
 * Retrieves all tasks associated with a specific factory.
 * Enforces multi-tenancy by filtering based on the factoryId.
 * @param factoryId - The ID of the factory whose tasks are to be fetched.
 * @returns An array of task objects, including related skill and worker data.
 */
export const getAllTasks = async (factoryId) => {
    return await prisma.task.findMany({
        where: {
            factoryId: factoryId
        },
        include: {
            requiredSkill: true,
            assignedWorker: true,
        },
        orderBy: {
            priority: 'desc', // Ensures critical tasks appear first.
        },
    });
};
/**
 * Creates a new task within a specific factory.
 * @param taskData - The data for the new task (description, priority, etc.).
 * @param factoryId - The ID of the factory where the task will be created.
 * @returns The newly created task object.
 */
export const createTask = async (taskData, factoryId) => {
    const newTask = await prisma.task.create({
        data: {
            description: taskData.description,
            priority: taskData.priority,
            requiredSkillId: taskData.requiredSkillId,
            factoryId: factoryId,
        },
    });
    // Emit a WebSocket event to all connected clients to notify them of the new task.
    io.emit('task:create', newTask);
    console.log(`📢 Emitted task:create for new Task ID: ${newTask.id}`);
    return newTask;
};
/**
 * Assigns a specific task to a specific worker.
 * This is a transactional operation to ensure data integrity.
 * @param taskId - The ID of the task to be assigned.
 * @param workerId - The ID of the worker to assign the task to.
 * @param factoryId - The ID of the factory, used for a security check.
 * @returns The updated task object.
 */
export const assignTaskToWorker = async (taskId, workerId, factoryId) => {
    // Use a Prisma transaction to ensure both the task and worker updates
    // succeed or fail together, preventing inconsistent data states.
    const [updatedTask, updatedWorker] = await prisma.$transaction(async (tx) => {
        // Security check: Ensure the task being updated belongs to the user's factory.
        const task = await tx.task.findFirst({
            where: { id: taskId, factoryId: factoryId }
        });
        if (!task) {
            throw new Error("Task not found or you do not have permission to access it.");
        }
        // Security check: Ensure the worker being assigned also belongs to the same factory.
        const worker = await tx.worker.findFirst({
            where: { id: workerId, factoryId: factoryId }
        });
        if (!worker) {
            throw new Error("Worker not found or you do not have permission to assign them.");
        }
        // Update the task to link it to the worker and set its status.
        const newUpdatedTask = await tx.task.update({
            where: { id: taskId },
            data: {
                assignedWorkerId: workerId,
                status: 'IN_PROGRESS',
            },
            include: { assignedWorker: true, requiredSkill: true } // Include relations for the frontend
        });
        // Update the worker's status to show they are now on a task.
        const newUpdatedWorker = await tx.worker.update({
            where: { id: workerId },
            data: {
                status: 'ON_TASK',
            },
        });
        return [newUpdatedTask, newUpdatedWorker];
    });
    // Emit WebSocket events AFTER the database transaction has successfully committed.
    io.emit('task:update', updatedTask);
    io.emit('worker:update', updatedWorker);
    console.log(`📢 Emitted task:update and worker:update for Task ID: ${updatedTask.id}`);
    return updatedTask;
};
//# sourceMappingURL=task.service.js.map