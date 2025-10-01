import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Fetches high-level analytics for an entire organization.
 * Intended for ORG_ADMIN users.
 * @param organizationId The ID of the organization to get analytics for.
 */
export const getOrgAnalytics = async (organizationId) => {
    // Run multiple aggregate queries in parallel for efficiency.
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
/**
 * Fetches detailed analytics for a single factory.
 * Intended for FACTORY_MANAGER and ORG_ADMIN users.
 * @param factoryId The ID of the factory to get analytics for.
 */
export const getFactoryAnalytics = async (factoryId) => {
    // Run multiple aggregate queries in parallel.
    const [activeWorkers, openTasks, totalTasks, completedTasks] = await prisma.$transaction([
        // Counts workers who are ready to work or are currently working.
        prisma.worker.count({
            where: {
                factoryId,
                status: { in: ['AVAILABLE', 'ON_TASK'] }
            }
        }),
        // Counts tasks that are not yet finished.
        prisma.task.count({
            where: {
                factoryId,
                status: { not: 'COMPLETED' }
            }
        }),
        // A simplified count for overall completion rate.
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
//# sourceMappingURL=dashboard.service.js.map