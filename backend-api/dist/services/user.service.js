import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Retrieves all users associated with a specific organization.
 * Enforces multi-tenancy by filtering based on the organizationId.
 * Crucially, it uses 'select' to explicitly exclude the passwordHash.
 * @param organizationId - The ID of the organization whose users are to be fetched.
 * @returns An array of user objects, safe to send to the client.
 */
export const getUsersByOrg = async (organizationId) => {
    const users = await prisma.user.findMany({
        where: {
            organizationId: organizationId,
        },
        // The 'select' clause is a security best practice. It ensures we ONLY
        // return the data we explicitly want, preventing accidental leakage
        // of sensitive fields like the passwordHash.
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            // We also include the name of the factory the user is assigned to.
            factory: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            email: 'asc', // Order the list alphabetically by email.
        },
    });
    return users;
};
//# sourceMappingURL=user.service.js.map