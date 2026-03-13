import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import Group from '../models/Group';
import MonthlySchedule from '../models/MonthlySchedule';
import User from '../models/User';
import Task from '../models/Task';
import { nanoid } from 'nanoid';

const router = Router();

// POST /api/groups — create group
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const { name, scheduleId } = req.body;
        const inviteCode = nanoid(6).toUpperCase();
        const group = await Group.create({
            name,
            scheduleId,
            adminId: user._id,
            members: [user._id],
            inviteCode,
        });
        await User.findByIdAndUpdate(user._id, { $addToSet: { groupIds: group._id } });
        res.status(201).json(group);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// POST /api/groups/join/:code
router.post('/join/:code', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const group = await Group.findOne({ inviteCode: (req.params.code as string).toUpperCase() });
        if (!group) { res.status(404).json({ error: 'Invalid invite code' }); return; }

        await Group.findByIdAndUpdate(group._id, { $addToSet: { members: user._id } });
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { groupIds: group._id, friends: { $each: group.members } },
        });
        res.json({ group, message: 'Joined successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to join group' });
    }
});

// GET /api/groups/:id/leaderboard
router.get('/:id/leaderboard', requireAuth, async (req: Request, res: Response) => {
    try {
        const group = await Group.findById(req.params.id).populate('members', 'name avatar');
        if (!group) { res.status(404).json({ error: 'Group not found' }); return; }

        const leaderboard = await Promise.all(
            group.members.map(async (member: any) => {
                const totalTasks = await Task.countDocuments({ userId: member._id });
                const completedTasks = await Task.countDocuments({ userId: member._id, status: 'completed' });
                const practiceLogAgg = await Task.aggregate([
                    { $match: { userId: member._id } },
                    { $group: { _id: null, totalMinutes: { $sum: '$practiceMinutes' } } },
                ]);
                return {
                    user: { _id: member._id, name: member.name, avatar: member.avatar },
                    totalTasks,
                    completedTasks,
                    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    totalStudyMinutes: practiceLogAgg[0]?.totalMinutes || 0,
                };
            })
        );
        leaderboard.sort((a, b) => b.completionRate - a.completionRate);
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
