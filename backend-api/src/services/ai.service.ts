import { type Task, type Worker, type WorkerSkill, type Skill } from '@prisma/client';

interface RecommendationResponse {
  recommended_worker_id: string | null;
  score?: number;
  worker_name?: string;
  message?: string;
}

type WorkerWithSkills = Worker & {
  skills: (WorkerSkill & { skill: Skill })[];
};

export const getRecommendationFromAI = async (
  task: Task,
  workers: WorkerWithSkills[]
): Promise<RecommendationResponse | null> => {
  console.log(`🧠 AI Engine (Internal): Analyzing ${workers.length} workers for task '${task.description}'...`);

  let bestWorker: WorkerWithSkills | null = null;
  let highestScore = -1;

  const WEIGHT_SKILL = 0.5;
  const WEIGHT_FATIGUE = 0.3;
  const WEIGHT_DISTANCE = 0.2;

  const taskX = task.location_x ?? 50.0;
  const taskY = task.location_y ?? 50.0;

  for (const worker of workers) {
    let skillScore = 0;
    let hasRequiredSkill = false;

    if (task.requiredSkillId) {
      const matchingSkill = worker.skills.find(s => s.skillId === task.requiredSkillId);
      if (matchingSkill) {
        skillScore = matchingSkill.proficiency / 5.0;
        hasRequiredSkill = true;
      }
      
      if (!hasRequiredSkill) continue;
    } else {
      skillScore = 1.0; 
    }
    const fatigueScore = 1.0 - (worker.fatigueLevel || 0);
    const workerX = worker.location_x || 0;
    const workerY = worker.location_y || 0;

    const distance = Math.sqrt(Math.pow(workerX - taskX, 2) + Math.pow(workerY - taskY, 2));

    const distanceScore = Math.max(0, 1.0 - (distance / 141.0));

    const totalScore = (
      (skillScore * WEIGHT_SKILL) +
      (fatigueScore * WEIGHT_FATIGUE) +
      (distanceScore * WEIGHT_DISTANCE)
    );

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestWorker = worker;
    }
  }

  if (bestWorker) {
    console.log(`✅ Recommendation: ${bestWorker.name} (Score: ${highestScore.toFixed(2)})`);
    return {
      recommended_worker_id: bestWorker.id,
      worker_name: bestWorker.name,
      score: highestScore
    };
  }

  return { recommended_worker_id: null, message: "No suitable worker found." };
};