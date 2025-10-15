import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const createFactory = async (name, organizationId) => {
    const newFactory = await prisma.factory.create({
        data: {
            name,
            organizationId,
            status: "APPROVED",
        },
    });
    return newFactory;
};
export const getFactoriesByOrg = async (organizationId) => {
    const factories = await prisma.factory.findMany({
        where: {
            organizationId: organizationId,
        },
    });
    return factories;
};
//# sourceMappingURL=factory.service.js.map