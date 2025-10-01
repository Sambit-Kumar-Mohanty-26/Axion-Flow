import { type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as userService from '../services/user.service.js';

export const handleGetUsers = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(401).json({ message: 'Organization ID not found in token.' });
  }

  try {
    const users = await userService.getUsersByOrg(organizationId);
    res.status(200).json(users);

  } catch (error) {
    console.error("Error fetching users for organization:", error);
    res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};