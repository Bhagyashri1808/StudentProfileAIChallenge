import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include user session data
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    role?: 'teacher' | 'student';
    firstName?: string;
    lastName?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'teacher' | 'student';
    firstName: string;
    lastName: string;
  };
}

// Middleware to check if user is authenticated
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return;
  }

  // Add user data to request object for easy access
  req.user = {
    id: req.session.userId,
    email: req.session.email!,
    role: req.session.role!,
    firstName: req.session.firstName!,
    lastName: req.session.lastName!
  };

  next();
};

// Middleware to check if user has specific role
export const requireRole = (allowedRoles: ('teacher' | 'student')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This resource requires ${allowedRoles.join(' or ')} role`
      });
      return;
    }

    next();
  };
};

// Middleware to check if user is a teacher
export const requireTeacher = requireRole(['teacher']);

// Middleware to check if user is a student
export const requireStudent = requireRole(['student']);

// Optional auth middleware (doesn't require authentication but adds user data if available)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      email: req.session.email!,
      role: req.session.role!,
      firstName: req.session.firstName!,
      lastName: req.session.lastName!
    };
  }
  next();
};