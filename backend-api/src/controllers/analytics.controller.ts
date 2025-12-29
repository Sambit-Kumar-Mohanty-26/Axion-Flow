import { type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as analyticsService from '../services/analytics.service.js';

export const handleGetReplayData = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });
  
  const minutes = req.query.minutes ? Number(req.query.minutes) : 30;

  try {
    const data = await analyticsService.getReplayData(factoryId, minutes);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch replay data' });
  }
};

export const handleGetHeatmap = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const grid = await analyticsService.getHeatmapData(factoryId);
    res.status(200).json(grid);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch heatmap' });
  }
};