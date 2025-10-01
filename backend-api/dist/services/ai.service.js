import axios from 'axios';
import {} from '@prisma/client';
const AI_SERVICE_URL = 'http://localhost:8000';
export const getRecommendationFromAI = async (task, workers) => {
    try {
        const payload = {
            task: task,
            available_workers: workers,
        };
        console.log('Sending payload to AI service:', JSON.stringify(payload, null, 2));
        const response = await axios.post(`${AI_SERVICE_URL}/api/recommend_worker`, payload);
        console.log('Received response from AI service:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error communicating with AI service:', error);
        return null;
    }
};
//# sourceMappingURL=ai.service.js.map