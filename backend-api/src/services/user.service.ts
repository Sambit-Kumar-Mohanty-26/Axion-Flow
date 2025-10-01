import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsersByOrg = async (organizationId: string) => {
  const users = await prisma.user.findMany({
    where: {
      organizationId: organizationId,
    },

    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      factory: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      email: 'asc',
    },
  });

  return users;
};