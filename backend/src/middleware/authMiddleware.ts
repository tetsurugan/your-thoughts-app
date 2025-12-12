import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Development backdoor for legacy endpoints if needed, but for now strict check
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Fallback for mock user if we want to allow guest access temporarily?
        // No, plan said replace mock-user-id. Strict mode.
        // Wait, existing controllers hardcode mock-user-id. I should update them later.
        // For now, this middleware is only applied to routes I choose.
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log('Auth Failed:', err.message);
            return res.sendStatus(403);
        }
        (req as any).user = user;
        console.log(`Auth Success: User ${user.userId} accessing ${req.method} ${req.originalUrl}`);
        next();
    });
};
