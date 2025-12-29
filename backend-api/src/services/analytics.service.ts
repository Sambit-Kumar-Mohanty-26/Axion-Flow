import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getReplayData = async (factoryId: string, minutesAgo: number = 60) => {
  const startTime = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  return await prisma.locationLog.findMany({
    where: {
      factoryId,
      timestamp: { gte: startTime }
    },
    orderBy: { timestamp: 'asc' }
  });
};

export const getHeatmapData = async (factoryId: string) => {
  const logs = await prisma.locationLog.findMany({
    where: { factoryId },
    select: { x: true, y: true }
  });

  const gridSize = 10;
  const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
  let maxCount = 0;

  logs.forEach(log => {
    const gridX = Math.min(Math.floor(log.x / 10), 9);
    const gridY = Math.min(Math.floor(log.y / 10), 9);
    
    grid[gridY][gridX]++;
    if (grid[gridY][gridX] > maxCount) maxCount = grid[gridY][gridX];
  });

  return grid.map(row => row.map(val => val / (maxCount || 1)));
};