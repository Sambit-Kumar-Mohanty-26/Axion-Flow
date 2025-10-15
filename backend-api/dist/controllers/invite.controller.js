import {} from 'express';
import {} from '../middleware/auth.middleware.js';
import * as inviteService from '../services/invite.service.js';
import { Role } from '@prisma/client';
export const handleCreateInvite = async (req, res) => {
    const { email, role, factoryId } = req.body;
    const organizationId = req.user?.organizationId;
    if (!email || !role || !factoryId || !organizationId) {
        return res.status(400).json({ message: 'Email, role, and factoryId are required.' });
    }
    if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }
    try {
        const invitation = await inviteService.createInvitation(email, role, factoryId, organizationId);
        res.status(201).json(invitation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating invitation', error: error.message });
    }
};
export const handleVerifyInvite = async (req, res) => {
    const { token } = req.params;
    try {
        const invitation = await inviteService.verifyInvitation(token);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found or has expired.' });
        }
        res.status(200).json({ email: invitation.email });
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying invitation', error: error.message });
    }
};
export const handleAcceptInvite = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required.' });
    }
    try {
        const jwt = await inviteService.acceptInvitation(token, password);
        res.status(200).json(jwt);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=invite.controller.js.map