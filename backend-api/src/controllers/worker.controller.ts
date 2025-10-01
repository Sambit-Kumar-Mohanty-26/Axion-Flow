import { type Response } from 'express';
import * as workerService from '../services/worker.service.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import { Prisma } from '@prisma/client';

export const handleGetAllWorkers = async (req: AuthRequest, res: Response) => {
  const factoryId = req.user?.factoryId;
  if (!factoryId) { return res.status(401).json({ message: 'Factory not found in token' }); }
  try {
    const workers = await workerService.getAllWorkers(factoryId);
    res.status(200).json(workers);
  } catch (error) { res.status(500).json({ message: 'Error fetching workers', error }); }
};

export const handleCreateWorker = async (req: AuthRequest, res: Response) => {
  const { name, skills } = req.body;
  const factoryId = req.user?.factoryId;
  if (!factoryId) { return res.status(401).json({ message: 'User must be associated with a factory.' }); }
  if (!name) { return res.status(400).json({ message: 'Worker name is required' }); }
  try {
    const newWorker = await workerService.createWorker(name, skills || [], factoryId);
    res.status(201).json(newWorker);
  } catch (error) { res.status(500).json({ message: 'Error creating worker', error }); }
};

export const handleBulkImport = async (req: AuthRequest, res: Response) => {
  const { workers } = req.body;
  const factoryId = req.user?.factoryId;
  const organizationId = req.user?.organizationId;
  if (!workers || !Array.isArray(workers) || workers.length === 0) { return res.status(400).json({ message: 'A non-empty array of workers is required.' }); }
  if (!factoryId || !organizationId) { return res.status(401).json({ message: 'User must be associated with a factory and organization.' }); }
  try {
    const result = await workerService.bulkImportWorkers(workers, factoryId, organizationId);
    res.status(201).json({ message: `${result.length} workers imported successfully.`, workers: result });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: "Import failed: One or more Employee IDs already exist in this factory."});
    }
    res.status(500).json({ message: 'Error during bulk import.', error: error.message });
  }
};

export const handleUpdateWorkerStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const factoryId = req.user?.factoryId;
  if (!status || !factoryId) { return res.status(400).json({ message: 'Status and factoryId from token are required.' }); }
  try {
    const updatedWorker = await workerService.updateWorkerStatus(id, status, factoryId);
    res.status(200).json(updatedWorker);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};