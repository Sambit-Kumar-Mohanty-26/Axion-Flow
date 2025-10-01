// src/services/invite.service.ts
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { loginUser } from './auth.service.js'; // We'll need this to log the user in
import { sendInvitationEmail } from './email.service.js';
const prisma = new PrismaClient();
/**
 * Creates a new invitation.
 */
export const createInvitation = async (email, role, factoryId, organizationId) => {
    // Generate a secure, URL-safe random token
    const token = crypto.randomBytes(32).toString('hex');
    // Set an expiration date for the invitation (e.g., 7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // We need to check if the factory they are being invited to belongs to the right organization
    const factory = await prisma.factory.findFirst({
        where: { id: factoryId, organizationId: organizationId }
    });
    if (!factory) {
        throw new Error("Invalid factory specified for this organization.");
    }
    const invitation = await prisma.invitation.create({
        data: {
            email,
            token,
            role,
            factoryId,
            expiresAt,
        },
    });
    try {
        await sendInvitationEmail({ to: email, token: token });
    }
    catch (emailError) {
        // If the email fails, we should ideally roll back the invitation creation
        // or flag it, but for a hackathon, logging the error is sufficient.
        console.error(`CRITICAL: Failed to send invitation email for token ${token}`, emailError);
    }
    // We can keep the console.log for our own testing convenience during the hackathon
    console.log(`   Invitation Link for testing: http://localhost:5173/accept-invite?token=${token}`);
    return invitation;
};
/**
 * Verifies an invitation token.
 * @returns The invitation object if valid, otherwise null.
 */
export const verifyInvitation = async (token) => {
    const invitation = await prisma.invitation.findUnique({
        where: { token },
    });
    // Check if invitation exists or has expired
    if (!invitation || invitation.expiresAt < new Date()) {
        return null;
    }
    return invitation;
};
/**
 * Creates a new user from an invitation and logs them in.
 */
export const acceptInvitation = async (token, password) => {
    const invitation = await verifyInvitation(token);
    if (!invitation) {
        throw new Error('Invitation is invalid or has expired.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // We need the organizationId from the factory to create the user
    const factory = await prisma.factory.findUnique({ where: { id: invitation.factoryId } });
    if (!factory) {
        throw new Error('Associated factory for this invitation no longer exists.');
    }
    const newUser = await prisma.user.create({
        data: {
            email: invitation.email,
            passwordHash,
            role: invitation.role,
            factoryId: invitation.factoryId,
            organizationId: factory.organizationId,
            status: 'APPROVED', // Users joining via invite are auto-approved
        },
    });
    // Delete the invitation so it cannot be used again
    await prisma.invitation.delete({ where: { id: invitation.id } });
    // Automatically log the new user in
    const jwt = await loginUser(newUser.email, password);
    return jwt;
};
//# sourceMappingURL=invite.service.js.map