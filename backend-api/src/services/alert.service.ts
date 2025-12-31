import { PrismaClient } from '@prisma/client';
import { io } from '../index.js';

const prisma = new PrismaClient();

export const createAlert = async (factoryId: string, message: string, type: 'INFO' | 'WARNING' | 'CRITICAL') => {
  const alert = await prisma.alert.create({
    data: {
      factoryId,
      message,
      type
    }
  });

  io.emit('alert:new', alert);
  return alert;
};

export const getAlerts = async (factoryId: string) => {
  return await prisma.alert.findMany({
    where: { factoryId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

export const markAllAsRead = async (factoryId: string) => {
  await prisma.alert.updateMany({
    where: { factoryId, isRead: false },
    data: { isRead: true }
  });
};