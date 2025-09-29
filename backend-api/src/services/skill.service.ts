import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllSkills = async () => {
  return await prisma.skill.findMany();
};

export const createSkill = async (name: string) => {
  const existingSkill = await prisma.skill.findUnique({
    where: { name },
  });

  if (existingSkill) {
    throw new Error('Skill with this name already exists');
  }

  return await prisma.skill.create({
    data: {
      name,
    },
  });
};