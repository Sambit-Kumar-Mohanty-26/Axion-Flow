import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllSkills = async (factoryId: string) => {
  return await prisma.skill.findMany({
    where: {
      factoryId: factoryId,
    },
  });
};

export const createSkill = async (name: string, factoryId: string) => {
  const existingSkill = await prisma.skill.findFirst({
    where: {
      name: name,
      factoryId: factoryId,
    },
  });

  if (existingSkill) {
    throw new Error('Skill with this name already exists in this factory');
  }

  return await prisma.skill.create({
    data: {
      name,
      factoryId,
    },
  });
};