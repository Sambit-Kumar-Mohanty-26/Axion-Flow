// src/controllers/skill.controller.ts
import {} from 'express'; // <-- FIX #2: Added 'type'
import * as skillService from '../services/skill.service.js';
import {} from '../middleware/auth.middleware.js'; // <-- Import our custom request type
export const handleGetAllSkills = async (req, res) => {
    // FIX #1: Get factoryId from the authenticated user
    const factoryId = req.user?.factoryId;
    if (!factoryId) {
        return res.status(401).json({ message: 'User factory not found in token' });
    }
    try {
        const skills = await skillService.getAllSkills(factoryId);
        res.status(200).json(skills);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching skills', error });
    }
};
export const handleCreateSkill = async (req, res) => {
    const { name } = req.body;
    // FIX #1: Get factoryId from the authenticated user
    const factoryId = req.user?.factoryId;
    if (!factoryId) {
        return res.status(401).json({ message: 'User factory not found in token' });
    }
    if (!name) {
        return res.status(400).json({ message: 'Skill name is required' });
    }
    try {
        const newSkill = await skillService.createSkill(name, factoryId);
        res.status(201).json(newSkill);
    }
    catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating skill', error });
    }
};
//# sourceMappingURL=skill.controller.js.map