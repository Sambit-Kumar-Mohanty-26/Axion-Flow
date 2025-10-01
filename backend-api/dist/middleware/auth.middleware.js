// src/middleware/auth.middleware.ts
import {} from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client'; // Import the Role enum from Prisma
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}
// --- SUB-STEP 2.3.2: UPDATE 'protect' MIDDLEWARE ---
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // We now verify the complete payload shape.
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach the entire decoded user object to the request.
        req.user = decoded;
        next(); // Proceed to the next middleware or the route handler.
    }
    catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
// --- SUB-STEP 2.3.3: CREATE 'authorize' MIDDLEWARE ---
// This new middleware checks for specific user roles.
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // This middleware should always run AFTER the 'protect' middleware.
        // We assume req.user has already been populated.
        const userRole = req.user?.role;
        if (!userRole) {
            // This case should technically be caught by 'protect', but it's a good safeguard.
            return res.status(401).json({ message: 'Not authorized, user role not found.' });
        }
        // Check if the user's role is in the list of roles allowed for this route.
        if (!allowedRoles.includes(userRole)) {
            // 403 Forbidden is the correct status code for a logged-in user who lacks permission.
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
        // If the role check passes, continue to the route handler.
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map