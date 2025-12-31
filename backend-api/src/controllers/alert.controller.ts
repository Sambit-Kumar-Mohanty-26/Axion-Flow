import { type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as alertService from '../services/alert.service.js';

export const handleGetAlerts = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });
  
  const alerts = await alertService.getAlerts(factoryId);
  res.status(200).json(alerts);
};

export const handleMarkRead = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;
  if (!factoryId) return res.status(401).json({ message: 'Unauthorized' });

  await alertService.markAllAsRead(factoryId);
  res.status(200).json({ success: true });
};