import {} from 'express';
import {} from '../middleware/auth.middleware.js';
import * as userService from '../services/user.service.js';
/**
 * Controller to handle requests for a list of all users in an organization.
 * It extracts the organizationId from the authenticated ORG_ADMIN's token.
 */
export const handleGetUsers = async (req, res) => {
    // Get the organization ID from the user's token, which was attached by the 'protect' middleware.
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        // This should theoretically never be hit if 'protect' and 'authorize' are working,
        // but it serves as a robust safeguard.
        return res.status(401).json({ message: 'Organization ID not found in token.' });
    }
    try {
        const users = await userService.getUsersByOrg(organizationId);
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users for organization:", error);
        res.status(500).json({ message: 'An error occurred while fetching users.' });
    }
};
//# sourceMappingURL=user.controller.js.map