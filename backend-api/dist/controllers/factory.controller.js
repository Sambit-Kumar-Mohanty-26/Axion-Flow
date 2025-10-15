import {} from 'express';
import {} from '../middleware/auth.middleware.js';
import * as factoryService from '../services/factory.service.js';
export const handleCreateFactory = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating factory', error });
    }
};
export const handleGetFactories = async (req, res) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(401).json({ message: 'Organization ID not found in token' });
    }
    try {
        const factories = await factoryService.getFactoriesByOrg(organizationId);
        res.status(200).json(factories);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching factories', error });
    }
};
//# sourceMappingURL=factory.controller.js.map