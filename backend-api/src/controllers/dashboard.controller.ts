import { type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as dashboardService from '../services/dashboard.service.js';
import * as simulationService from '../services/simulation.service.js';

export const handleGetOrgAnalytics = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(401).json({ message: 'Organization ID not found in token.' });
  }
  
  try {
    const analytics = await dashboardService.getOrgAnalytics(organizationId);
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching organization analytics:", error);
    res.status(500).json({ message: 'Error fetching organization analytics.' });
  }
};


export const handleGetFactoryAnalytics = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;

  if (!factoryId) {
    return res.status(401).json({ message: 'Factory ID not found in token.' });
  }
  
  try {
    const analytics = await dashboardService.getFactoryAnalytics(factoryId);
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching factory analytics:", error);
    res.status(500).json({ message: 'Error fetching factory analytics.' });
  }
};

export const handleRunSimulation = async (req: AuthRequest, res: Response) => {
  const { taskCount, taskDifficulty, shiftHours, deadlineHours } = req.body;
  const factoryId = req.user?.factoryId;

  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const results = await simulationService.runSimulation({
      factoryId,
      taskCount: Number(taskCount),
      taskDifficulty,
      shiftHours: Number(shiftHours || 8),
      deadlineHours: Number(deadlineHours || 24)
    });
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};