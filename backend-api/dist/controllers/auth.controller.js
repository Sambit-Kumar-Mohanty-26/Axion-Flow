// src/controllers/auth.controller.ts
import {} from 'express';
import * as authService from '../services/auth.service.js';
import { runAiVerification } from '../services/aiVerification.service.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// --- UPDATED handleRegister FUNCTION ---
export const handleRegister = async (req, res) => {
    const { email, password, organizationName } = req.body;
    if (!email || !password || !organizationName) {
        return res.status(400).json({ message: 'Email, password, and organization name are required' });
    }
    try {
        // Step 1: Call the registerUser service.
        const newUser = await authService.registerUser(email, password, organizationName);
        // Step 2: Trigger AI verification in the background (fire-and-forget).
        // We don't use 'await' here because we don't want the user to wait for the result.
        runAiVerification(newUser.organizationId, newUser.email, organizationName);
        // Step 3: Immediately respond to the user that the process has started.
        // 202 Accepted is the correct HTTP status for this action.
        res.status(202).json({
            message: 'Registration successful. Your organization is now pending AI verification.',
            userId: newUser.id,
            organizationId: newUser.organizationId
        });
    }
    catch (error) {
        // Handle specific errors like "email already exists"
        if (error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};
// --- UNCHANGED handleLogin FUNCTION ---
export const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
// --- NEW check-status Endpoint Controller ---
export const handleCheckStatus = async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: 'Email parameter is required.' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
            select: { status: true } // Only select the status field for security
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ status: user.status });
    }
    catch (error) {
        res.status(500).json({ message: 'Error checking user status.' });
    }
};
// Add this to src/controllers/auth.controller.ts
export const handleWorkerLogin = async (req, res) => {
    const { factoryId, employeeId, password } = req.body;
    if (!factoryId || !employeeId || !password) {
        return res.status(400).json({ message: 'Factory ID, Employee ID, and password are required.' });
    }
    try {
        const result = await authService.loginWorker(factoryId, employeeId, password);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
//# sourceMappingURL=auth.controller.js.map