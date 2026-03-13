import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import MockTest from '../models/MockTest';
import User from '../models/User';

const router = Router();

// GET /api/mocks
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }
        const mocks = await MockTest.find({ userId: user._id }).sort({ date: -1 }).limit(50);
        res.json(mocks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mocks' });
    }
});

// GET /api/mocks/:id
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const mock = await MockTest.findById(req.params.id);
        if (!mock) { res.status(404).json({ error: 'Mock not found' }); return; }
        res.json(mock);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mock' });
    }
});

// POST /api/mocks
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }
        const mock = await MockTest.create({ ...req.body, userId: user._id });
        res.status(201).json(mock);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create mock' });
    }
});

// DELETE /api/mocks/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await MockTest.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete mock' });
    }
});

export default router;
