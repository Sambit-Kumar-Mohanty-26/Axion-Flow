import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { loginUser } from './auth.service.js';
import { sendInvitationEmail } from './email.service.js';
const prisma = new PrismaClient();
export const createInvitation = async (email, role, factoryId, organizationId) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
        console.error(`CRITICAL: Failed to send invitation email for token ${token}`, emailError);
    }
    console.log(`   Invitation Link for testing: http://localhost:5173/accept-invite?token=${token}`);
    return invitation;
};
export const verifyInvitation = async (token) => {
    const invitation = await prisma.invitation.findUnique({
        where: { token },
    });
    if (!invitation || invitation.expiresAt < new Date()) {
        return null;
    }
    return invitation;
};
export const acceptInvitation = async (token, password) => {
    const invitation = await verifyInvitation(token);
    if (!invitation) {
        throw new Error('Invitation is invalid or has expired.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
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
            status: 'APPROVED',
        },
    });
    await prisma.invitation.delete({ where: { id: invitation.id } });
    const jwt = await loginUser(newUser.email, password);
    return jwt;
};
//# sourceMappingURL=invite.service.js.map