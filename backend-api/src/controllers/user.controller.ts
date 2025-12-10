import { type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as userService from '../services/user.service.js';
import { Role } from '@prisma/client';

export const handleGetUsers = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Org ID missing' });
  
  try {
    const users = await userService.getUsersByOrg(organizationId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const handleDeleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isInvite = req.query.type === 'invite';
  
  try {
    await userService.deleteUserOrInvite(id, isInvite);
    res.status(200).json({ message: 'User/Invite deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const handleUpdateRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!Object.values(Role).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const updatedUser = await userService.updateUserRole(id, role);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role' });
  }
};