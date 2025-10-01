import { type Request, type Response } from 'express';
import * as authService from '../services/auth.service.js';
import { runAiVerification } from '../services/aiVerification.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleRegister = async (req: Request, res: Response) => {
  const { email, password, organizationName } = req.body;
  if (!email || !password || !organizationName) {
    return res.status(400).json({ message: 'Email, password, and organization name are required' });
  }

  try {
    const newUser = await authService.registerUser(email, password, organizationName);

    runAiVerification(newUser.organizationId, newUser.email, organizationName);

    res.status(202).json({ 
        message: 'Registration successful. Your organization is now pending AI verification.',
        userId: newUser.id,
        organizationId: newUser.organizationId
    });

  } catch (error: any) {
    if (error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const handleCheckStatus = async (req: Request, res: Response) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: 'Email parameter is required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
            select: { status: true } 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ status: user.status });

    } catch (error) {
        res.status(500).json({ message: 'Error checking user status.' });
    }
};

export const handleWorkerLogin = async (req: Request, res: Response) => {
  const { factoryId, employeeId, password } = req.body;
  if (!factoryId || !employeeId || !password) {
    return res.status(400).json({ message: 'Factory ID, Employee ID, and password are required.' });
  }
  try {
    const result = await authService.loginWorker(factoryId, employeeId, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};