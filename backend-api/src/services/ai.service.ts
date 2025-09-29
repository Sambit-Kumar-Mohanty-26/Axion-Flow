import axios from 'axios';
import { type Task, type Worker, type WorkerSkill, type Skill } from '@prisma/client';

const AI_SERVICE_URL = 'http://localhost:8000';

interface RecommendationResponse {
  recommended_worker_id: string | null;
  score?: number;
  worker_name?: string;
}
type WorkerWithSkills = Worker & {
  skills: (WorkerSkill & { skill: Skill })[];
};

export const getRecommendationFromAI = async (
  task: Task,
  workers: WorkerWithSkills[]
): Promise<RecommendationResponse | null> => {
  try {
    const payload = {
      task: task,
      available_workers: workers,
    };

    console.log('Sending payload to AI service:', JSON.stringify(payload, null, 2));

    const response = await axios.post<RecommendationResponse>(
      `${AI_SERVICE_URL}/api/recommend_worker`,
      payload
    );

    console.log('Received response from AI service:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error communicating with AI service:', error);
    return null; 
  }
};