import { type Request, type Response } from 'express';
import * as workerService from '../services/worker.service.js';

export const handleGetAllWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await workerService.getAllWorkers();
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers', error });
  }
};

export const handleCreateWorker = async (req: Request, res: Response) => {
  const { name, skills } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Worker name is required' });
  }

  try {
    const newWorker = await workerService.createWorker(name, skills || []);
    res.status(201).json(newWorker);
  } catch (error) {
    res.status(500).json({ message: 'Error creating worker', error });
  }
};