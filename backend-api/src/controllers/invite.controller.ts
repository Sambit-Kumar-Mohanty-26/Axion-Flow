import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import * as inviteService from '../services/invite.service.js';
import { Role, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleCreateInvite = async (req: AuthRequest, res: Response) => {
  const { email, role, factoryId } = req.body;
  const organizationId = req.user?.organizationId;
  const inviterId = req.user?.userId;
  if (!email || !role || !factoryId || !organizationId || !inviterId) {
    return res.status(400).json({ message: 'Missing required information or invalid session.' });
  }
  if (!Object.values(Role).includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true }
    });

    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { email: true }
    });

    if (!org || !inviter) {
       return res.status(404).json({ message: 'Organization or Inviter not found.' });
    }

    const invitation = await inviteService.createInvitation(
      email, 
      role, 
      factoryId, 
      organizationId,
      inviter.email, 
      org.name       
    );
    
    res.status(201).json(invitation);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating invitation', error: error.message });
  }
};

export const handleVerifyInvite = async (req: Request, res: Response) => {
  const { token } = req.params;
  try {
    const invitation = await inviteService.verifyInvitation(token);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or has expired.' });
    }
    res.status(200).json({ email: invitation.email });
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying invitation', error: error.message });
  }
};

export const handleAcceptInvite = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required.' });
  }

  try {
    const jwt = await inviteService.acceptInvitation(token, password);
    res.status(200).json(jwt);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};