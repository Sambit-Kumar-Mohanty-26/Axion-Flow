import { type Request, type Response } from 'express';
import * as skillService from '../services/skill.service.js';

export const handleGetAllSkills = async (req: Request, res: Response) => {
  try {
    const skills = await skillService.getAllSkills();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error });
  }
};

export const handleCreateSkill = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Skill name is required' });
  }

  try {
    const newSkill = await skillService.createSkill(name);
    res.status(201).json(newSkill);
  } catch (error: any) {
    if (error.message === 'Skill with this name already exists') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating skill', error });
  }
};