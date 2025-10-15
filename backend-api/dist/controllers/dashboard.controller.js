import {} from 'express';
import {} from '../middleware/auth.middleware.js';
import * as dashboardService from '../services/dashboard.service.js';
export const handleGetOrgAnalytics = async (req, res) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(401).json({ message: 'Organization ID not found in token.' });
    }
    try {
        const analytics = await dashboardService.getOrgAnalytics(organizationId);
        res.status(200).json(analytics);
    }
    catch (error) {
        console.error("Error fetching organization analytics:", error);
        res.status(500).json({ message: 'Error fetching organization analytics.' });
    }
};
export const handleGetFactoryAnalytics = async (req, res) => {
    const factoryId = req.user?.factoryId;
    if (!factoryId) {
        return res.status(401).json({ message: 'Factory ID not found in token.' });
    }
    try {
        const analytics = await dashboardService.getFactoryAnalytics(factoryId);
        res.status(200).json(analytics);
    }
    catch (error) {
        console.error("Error fetching factory analytics:", error);
        res.status(500).json({ message: 'Error fetching factory analytics.' });
    }
};
//# sourceMappingURL=dashboard.controller.js.map