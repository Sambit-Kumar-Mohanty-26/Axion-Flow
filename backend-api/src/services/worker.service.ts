import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllWorkers = async () => {
  return await prisma.worker.findMany({
    include: {
      skills: {
        include: {
          skill: true, 
        },
      },
    },
  });
};

export const createWorker = async (
  name: string,
  skills: { skillId: string; proficiency: number }[]
) => {
  return await prisma.worker.create({
    data: {
      name,
      skills: {
        create: skills.map((skill) => ({
          skillId: skill.skillId,
          proficiency: skill.proficiency,
        })),
      },
    },
    include: {
      skills: { include: { skill: true } }, 
    },
  });
};