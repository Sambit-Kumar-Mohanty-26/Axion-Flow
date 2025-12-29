import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createFactory = async (name: string, organizationId: string) => {
  const newFactory = await prisma.factory.create({
    data: {
      name,
      organizationId,
      status: "APPROVED", 
    },
  });
  return newFactory;
};

export const getFactoriesByOrg = async (organizationId: string) => {
  const factories = await prisma.factory.findMany({
    where: {
      organizationId: organizationId,
    },
  });
  return factories;
};

export const getFactoryById = async (factoryId: string) => {
  return await prisma.factory.findUnique({
    where: { id: factoryId }
  });
};

export const updateFactoryLayout = async (factoryId: string, layout: any) => {
  const updatedFactory = await prisma.factory.update({
    where: { id: factoryId },
    data: { layout }
  });
  
  return updatedFactory;
};