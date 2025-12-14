import { PrismaClient } from '@prisma/client';
import { io } from '../index.js';

const prisma = new PrismaClient();
const UPDATE_INTERVAL_MS = 3000; 
const MOVE_STEP = 5; 
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

let isRunning = false;

export const startDataFeeder = () => {
  if (isRunning) {
    console.log("⚠️ Data Feeder is already running. Skipping start.");
    return;
  }

  isRunning = true;
  console.log("🤖 Data Feeder: Simulation Engine STARTED.");

  setInterval(async () => {
    try {
      const workers = await prisma.worker.findMany();

      if (workers.length === 0) {
        return;
      }

      await Promise.all(workers.map(async (worker) => {
        if (worker.status === 'ABSENT') return;

        let { location_x, location_y } = worker;
        const deltaX = (Math.random() * MOVE_STEP * 2) - MOVE_STEP;
        const deltaY = (Math.random() * MOVE_STEP * 2) - MOVE_STEP;

        location_x += deltaX;
        location_y += deltaY;

        location_x = clamp(location_x, 0, 100);
        location_y = clamp(location_y, 0, 100);

        const updatedWorker = await prisma.worker.update({
          where: { id: worker.id },
          data: {
            location_x,
            location_y
          },
          include: { skills: { include: { skill: true } } } 
        });
        io.emit('worker:update', updatedWorker);
      }));

    } catch (error) {
      console.error("🤖 Data Feeder Error:", error);
    }
  }, UPDATE_INTERVAL_MS);
};