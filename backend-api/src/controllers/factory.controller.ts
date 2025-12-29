import { type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as factoryService from '../services/factory.service.js';

export const handleCreateFactory = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const organizationId = req.user?.organizationId; 

  if (!name) {
    return res.status(400).json({ message: 'Factory name is required' });
  }
  if (!organizationId) {
    return res.status(401).json({ message: 'Organization ID not found in token' });
  }

  try {
    const newFactory = await factoryService.createFactory(name, organizationId);
    res.status(201).json(newFactory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating factory', error });
  }
};

export const handleGetFactories = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(401).json({ message: 'Organization ID not found in token' });
  }

  try {
    const factories = await factoryService.getFactoriesByOrg(organizationId);
    res.status(200).json(factories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching factories', error });
  }
};


export const handleUpdateLayout = async (req: AuthRequest, res: Response) => {
  const { layout } = req.body;
  const factoryId = req.user?.factoryId;

  if (!factoryId) {
    return res.status(401).json({ message: 'Factory ID not found in token. Please log in as a Manager.' });
  }

  try {
    const factory = await factoryService.updateFactoryLayout(factoryId, layout);
    res.status(200).json(factory);
  } catch (error) {
    console.error("Layout Update Error:", error);
    res.status(500).json({ message: 'Failed to save layout.' });
  }
};

export const handleGetLayout = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;

  if (!factoryId) {
    return res.status(401).json({ message: 'Factory ID not found in token.' });
  }

  try {
    const factory = await factoryService.getFactoryById(factoryId);
    res.status(200).json(factory?.layout || []);
  } catch (error) {
    console.error("Layout Fetch Error:", error);
    res.status(500).json({ message: 'Failed to fetch layout.' });
  }
};