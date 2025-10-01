// src/services/factory.service.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Creates a new Factory within a given Organization.
 * @param name - The name of the new factory.
 * @param organizationId - The ID of the organization this factory belongs to.
 * @returns The newly created factory object.
 */
export const createFactory = async (name, organizationId) => {
    const newFactory = await prisma.factory.create({
        data: {
            name,
            organizationId,
            status: "APPROVED", // New factories created by an admin are auto-approved
        },
    });
    return newFactory;
};
/**
 * Retrieves all factories belonging to a specific organization.
 * @param organizationId - The ID of the organization.
 * @returns An array of factory objects.
 */
export const getFactoriesByOrg = async (organizationId) => {
    const factories = await prisma.factory.findMany({
        where: {
            organizationId: organizationId,
        },
    });
    return factories;
};
//# sourceMappingURL=factory.service.js.map