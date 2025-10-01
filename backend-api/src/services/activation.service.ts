import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginUser } from './auth.service.js';

const prisma = new PrismaClient();

export const verifyEmployee = async (factoryId: string, employeeId: string) => {
  const worker = await prisma.worker.findFirst({
    where: {
      factoryId: factoryId,
      employeeId: employeeId,
      user: {
        status: 'PENDING',
        passwordHash: null,
      },
    },
    select: {
      name: true,
    },
  });

  if (!worker) {
    throw new Error('Employee ID not found or account is already active. Please contact your manager.');
  }

  return { name: worker.name };
};

export const completeActivation = async (factoryId: string, employeeId: string, password: string) => {
  const userToActivate = await prisma.user.findFirst({
    where: {
      status: 'PENDING',
      passwordHash: null,
      worker: {
        factoryId: factoryId,
        employeeId: employeeId,
      },
    },
  });

  if (!userToActivate) {
    throw new Error('Activation failed. Account not found or already active.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userToActivate.id },
    data: {
      passwordHash: passwordHash,
      status: 'APPROVED',
    },
  });

  const jwt = await loginUser(userToActivate.email, password);
  return jwt;
};