import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
export const getUsersByOrg = async (organizationId: string) => {
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true, email: true, role: true, status: true,
      factory: { select: { name: true } }
    },
    orderBy: { email: 'asc' },
  });
  const invites = await prisma.invitation.findMany({
    where: { factory: { organizationId } },
    include: { factory: { select: { name: true } } }
  });

  const formattedInvites = invites.map(invite => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: 'INVITED',
    factory: { name: invite.factory.name },
    isInvite: true
  }));

  return [...users, ...formattedInvites];
};

export const deleteUserOrInvite = async (id: string, isInvite: boolean) => {
  if (isInvite) {
    return await prisma.invitation.delete({ where: { id } });
  } else {
    return await prisma.user.delete({ where: { id } });
  }
};

export const updateUserRole = async (userId: string, newRole: Role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });
};