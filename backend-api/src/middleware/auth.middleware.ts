import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    factoryId: string;
    organizationId: string;
    role: Role;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      factoryId: string;
      organizationId: string;
      role: Role;
    };
 
    req.user = decoded; 
    next();

  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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