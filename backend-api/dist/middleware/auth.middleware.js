import {} from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({ message: 'Not authorized, user role not found.' });
        }
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map