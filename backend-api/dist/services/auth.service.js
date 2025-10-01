// src/services/auth.service.ts
import { PrismaClient, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runAiVerification } from './aiVerification.service.js'; // We will create this next
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
    process.exit(1);
}
// --- NEW, CORRECTED registerUser FUNCTION ---
export const registerUser = async (email, password, organizationName) => {
    // Check if an organization with this name already exists to prevent duplicates
    const existingOrg = await prisma.organization.findUnique({ where: { name: organizationName } });
    if (existingOrg) {
        throw new Error('An organization with this name already exists.');
    }
    // Step 1: Create the top-level Organization with a PENDING status
    const organization = await prisma.organization.create({
        data: {
            name: organizationName,
            status: "PENDING",
        },
    });
    // Step 2: Create the first default Factory for this Organization, also PENDING
    const factory = await prisma.factory.create({
        data: {
            name: `${organizationName} HQ`, // A sensible default name
            organizationId: organization.id,
            status: "PENDING",
        },
    });
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        // Step 3: Create the User, assign them as ORG_ADMIN, but also with a PENDING status
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                factoryId: factory.id,
                organizationId: organization.id,
                role: Role.ORG_ADMIN, // This user will be the admin IF approved
                status: "PENDING",
            },
        });
        // Omit the password hash from the returned user object
        const { passwordHash: _, ...userWithoutPassword } = user;
        // Return all the necessary info for the AI verification step
        return { ...userWithoutPassword, organizationName: organization.name };
    }
    catch (error) {
        // This catch block handles the case where the email is already in use
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // Clean up the created organization and factory if user creation fails
            await prisma.factory.delete({ where: { id: factory.id } });
            await prisma.organization.delete({ where: { id: organization.id } });
            throw new Error('A user with this email already exists.');
        }
        // Re-throw any other unexpected errors
        throw error;
    }
};
// --- UPDATED loginUser FUNCTION ---
export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    // --- CRITICAL SECURITY GATE ---
    // If the user doesn't exist OR their status is NOT approved, fail immediately.
    if (!user || user.status !== "APPROVED") {
        // We use a generic error message to prevent revealing whether an email is registered or just pending.
        throw new Error('Invalid credentials or account not approved.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign({
        userId: user.id,
        factoryId: user.factoryId,
        organizationId: user.organizationId,
        role: user.role,
        email: user.email
    }, JWT_SECRET, { expiresIn: '24h' });
    return { token };
};
// Add this to src/services/auth.service.ts
export const loginWorker = async (factoryId, employeeId, password) => {
    // Find the worker profile first
    const worker = await prisma.worker.findUnique({
        where: { factoryId_employeeId: { factoryId, employeeId } },
        include: { user: true } // Include the linked User record
    });
    if (!worker || !worker.user) {
        throw new Error('Invalid credentials.');
    }
    const user = worker.user;
    if (user.status !== 'APPROVED' || !user.passwordHash) {
        throw new Error('Account is not active.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials.');
    }
    // If everything is valid, generate a token using the user's data
    const token = jwt.sign({
        userId: user.id,
        factoryId: user.factoryId,
        organizationId: user.organizationId,
        role: user.role,
        email: user.email // Still good to have in the token
    }, JWT_SECRET);
    return { token };
};
//# sourceMappingURL=auth.service.js.map