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
export const registerUser = async (email, password, organizationName) => {
    const existingOrg = await prisma.organization.findUnique({ where: { name: organizationName } });
    if (existingOrg) {
        throw new Error('An organization with this name already exists.');
    }
    const organization = await prisma.organization.create({
        data: {
            name: organizationName,
            status: "PENDING",
        },
    });
    const factory = await prisma.factory.create({
        data: {
            name: `${organizationName} HQ`,
            organizationId: organization.id,
            status: "PENDING",
        },
    });
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                factoryId: factory.id,
                organizationId: organization.id,
                role: Role.ORG_ADMIN,
                status: "PENDING",
            },
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return { ...userWithoutPassword, organizationName: organization.name };
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            await prisma.factory.delete({ where: { id: factory.id } });
            await prisma.organization.delete({ where: { id: organization.id } });
            throw new Error('A user with this email already exists.');
        }
        throw error;
    }
};
export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "APPROVED") {
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
export const loginWorker = async (factoryId, employeeId, password) => {
    const worker = await prisma.worker.findUnique({
        where: { factoryId_employeeId: { factoryId, employeeId } },
        include: { user: true }
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
    const token = jwt.sign({
        userId: user.id,
        factoryId: user.factoryId,
        organizationId: user.organizationId,
        role: user.role,
        email: user.email
    }, JWT_SECRET);
    return { token };
};
//# sourceMappingURL=auth.service.js.map