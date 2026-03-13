import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY!,
        });
        (req as any).userId = payload.sub;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
