import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SimulationParams {
  factoryId: string;
  taskCount: number;
  taskDifficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  shiftHours: number;
  deadlineHours: number;
}

export const runSimulation = async ({ factoryId, taskCount, taskDifficulty, shiftHours, deadlineHours }: SimulationParams) => {
  const workers = await prisma.worker.findMany({
    where: { factoryId, status: { not: 'ABSENT' } }
  });

  if (workers.length === 0) throw new Error("No workers available to simulate.");

  let totalMinutes = 0;
  const timeStep = 30;
  let tasksQueue = taskCount;
  const deadlineMins = deadlineHours * 60;
  const shiftLengthMins = shiftHours * 60;
  const dayLengthMins = 24 * 60;

  const difficultyMult = taskDifficulty === 'HIGH' ? 2.0 : taskDifficulty === 'LOW' ? 0.6 : 1.0;
  
  const baseSpeed = 1.0; 
  const workerSpeedPerHour = baseSpeed / difficultyMult; 
  const workerSpeedPerTick = workerSpeedPerHour * (timeStep / 60);

  const timeSeriesData: any[] = [];

  let simWorkers = workers.map(w => ({
    currentFatigue: w.fatigueLevel || 0
  }));

  const MAX_MINUTES = 30 * dayLengthMins;

  while (tasksQueue > 0 && totalMinutes < MAX_MINUTES) {
    const minutesInDay = totalMinutes % dayLengthMins;
    const isWorkingHours = minutesInDay < shiftLengthMins;

    if (isWorkingHours) {
      let totalThroughputThisTick = 0;

      for (const worker of simWorkers) {
        worker.currentFatigue = Math.min(1.0, worker.currentFatigue + (0.015 * difficultyMult));

        const fatiguePenalty = 1 - (worker.currentFatigue * 0.4);
        
        totalThroughputThisTick += (workerSpeedPerTick * fatiguePenalty);
      }

      tasksQueue -= totalThroughputThisTick;
      if (tasksQueue < 0) tasksQueue = 0;

    } else {
      simWorkers.forEach(w => w.currentFatigue = Math.max(0.05, w.currentFatigue - 0.1));
    }

    if (isWorkingHours || minutesInDay === shiftLengthMins) {
       const avgFatigue = simWorkers.reduce((acc, w) => acc + w.currentFatigue, 0) / simWorkers.length;
       const currentDay = Math.floor(totalMinutes / dayLengthMins) + 1;
       const dayHour = Math.floor(minutesInDay / 60);

       timeSeriesData.push({
         timeLabel: `D${currentDay} ${dayHour}h`,
         tasksRemaining: Math.round(tasksQueue),
         avgFatigue: (avgFatigue * 100).toFixed(1)
       });
    }

    totalMinutes += timeStep;
  }

  const isDeadlineMissed = totalMinutes > deadlineMins;
  const totalHours = totalMinutes / 60;
  const actualThroughputPerHour = taskCount / totalHours;

  let riskLevel = "LOW";
  let riskReason = "Optimal Schedule";
  let recommendations: string[] = [];

  if (isDeadlineMissed) {
    riskLevel = "CRITICAL";
    riskReason = `Deadline Missed by ${((totalMinutes - deadlineMins) / 60).toFixed(1)} hrs`;
    
    const requiredSpeed = taskCount / deadlineHours;
    const speedDeficit = requiredSpeed - actualThroughputPerHour;
    const workersNeeded = Math.ceil(speedDeficit / workerSpeedPerHour);
    
    if (workersNeeded > 0) {
        recommendations.push(`Hire ${workersNeeded} additional workers.`);
    }
    
    if (shiftHours < 12) {
        recommendations.push(`Extend shift length to ${Math.min(12, shiftHours + 4)} hours.`);
    }

  } else if (taskDifficulty === 'HIGH') {
    riskLevel = "MEDIUM";
    riskReason = "High Fatigue Risk";
    recommendations.push("Schedule mandatory breaks every 2 hours.");
  }

  if (recommendations.length === 0) {
      recommendations.push("Current resources are sufficient.");
  }

  return {
    timeSeries: timeSeriesData,
    estimatedCompletionTime: totalMinutes,
    workDays: Math.ceil(totalMinutes / dayLengthMins),
    tasksCompleted: taskCount,
    bottleneckRisk: riskLevel !== "LOW",
    riskLevel,
    riskReason,
    recommendations,
    lateTasks: isDeadlineMissed ? Math.round(tasksQueue) : 0
  };
};