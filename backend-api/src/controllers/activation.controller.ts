import { type Request, type Response } from 'express';
import * as activationService from '../services/activation.service.js';

export const handleVerifyEmployee = async (req: Request, res: Response) => {
  const { factoryId, employeeId } = req.body;

  if (!factoryId || !employeeId) {
    return res.status(400).json({ message: 'factoryId and employeeId are required.' });
  }

  try {
    const result = await activationService.verifyEmployee(factoryId, employeeId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const handleCompleteActivation = async (req: Request, res: Response) => {
  const { factoryId, employeeId, password } = req.body;

  if (!factoryId || !employeeId || !password) {
    return res.status(400).json({ message: 'factoryId, employeeId, and password are required.' });
  }
  if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.'});
  }

  try {
    const jwt = await activationService.completeActivation(factoryId, employeeId, password);
    res.status(200).json(jwt);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};