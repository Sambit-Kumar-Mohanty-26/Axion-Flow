// src/services/activation.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginUser } from './auth.service.js';
const prisma = new PrismaClient();
/**
 * Verifies if a pending worker account exists for a given employee ID and factory ID.
 * @param factoryId The ID of the factory from the shareable link.
 * @param employeeId The Employee ID entered by the worker.
 * @returns The worker's name if a valid pending account is found.
 */
export const verifyEmployee = async (factoryId, employeeId) => {
    const worker = await prisma.worker.findFirst({
        where: {
            factoryId: factoryId,
            employeeId: employeeId,
            // Crucially, we check that there is a linked User account that is PENDING
            user: {
                status: 'PENDING',
                passwordHash: null, // And has no password set yet
            },
        },
        select: {
            name: true, // Only return the name for the "Welcome, [Name]!" message
        },
    });
    if (!worker) {
        throw new Error('Employee ID not found or account is already active. Please contact your manager.');
    }
    return { name: worker.name };
};
/**
 * Completes the account activation for a pending worker.
 * @param factoryId The ID of the factory.
 * @param employeeId The Employee ID.
 * @param password The new password set by the worker.
 * @returns A JWT for the newly activated and logged-in user.
 */
export const completeActivation = async (factoryId, employeeId, password) => {
    // Find the specific User record to update
    const userToActivate = await prisma.user.findFirst({
        where: {
            status: 'PENDING',
            passwordHash: null,
            worker: {
                factoryId: factoryId,
                employeeId: employeeId,
            },
        },
    });
    if (!userToActivate) {
        throw new Error('Activation failed. Account not found or already active.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // Update the user's account to be active and set their password
    await prisma.user.update({
        where: { id: userToActivate.id },
        data: {
            passwordHash: passwordHash,
            status: 'APPROVED',
        },
    });
    // Automatically log the newly activated user in
    const jwt = await loginUser(userToActivate.email, password);
    return jwt;
};
//# sourceMappingURL=activation.service.js.map