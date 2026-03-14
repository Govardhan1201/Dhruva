import { Router, Request, Response } from 'express';
import User from '../models/User';
import { requireAuth } from '../middleware/clerkAuth';
import { clerkClient } from '@clerk/express';

const router = Router();

// POST /api/auth/webhook — Clerk webhook to sync user
router.post('/webhook', async (req: Request, res: Response) => {
    const { type, data } = req.body;
    try {
        if (type === 'user.created' || type === 'user.updated') {
            const { id, first_name, last_name, email_addresses, image_url } = data;
            const email = email_addresses?.[0]?.email_address;
            await User.findOneAndUpdate(
                { clerkId: id },
                { clerkId: id, name: `${first_name} ${last_name}`.trim(), email, avatar: image_url },
                { upsert: true, new: true }
            );
        }
        res.json({ received: true });
    } catch (err) {
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// GET /api/auth/me — get current user profile (auto-creates on first sign-in)
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        let user = await User.findOne({ clerkId }).populate('examId', 'name slug category');

        if (!user) {
            // Auto-create user from Clerk data (no webhook needed for local dev)
            try {
                const clerkUser = await clerkClient.users.getUser(clerkId);
                const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
                const firstName = clerkUser.firstName || '';
                const lastName = clerkUser.lastName || '';
                const name = `${firstName} ${lastName}`.trim() || email.split('@')[0];
                const avatar = clerkUser.imageUrl || '';
                user = await User.create({ clerkId, name, email, avatar });
            } catch (clerkErr) {
                // Fallback: create minimal user record
                user = await User.create({ clerkId, name: 'User', email: '', avatar: '' });
            }
            // Populate after creation
            user = await User.findOne({ clerkId }).populate('examId', 'name slug category') as any;
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PATCH /api/auth/me — update user (set exam, etc.)
router.patch('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const { examId, name } = req.body;
        const user = await User.findOneAndUpdate({ clerkId }, { examId, name }, { new: true }).populate('examId', 'name slug category');
        res.json(user);
    } catch (err) {
        console.error('Failed to update user in /auth/me:', err);
        res.status(500).json({ error: 'Failed to update user', details: err instanceof Error ? err.message : 'Unknown' });
    }
});

export default router;
