import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import MonthlySchedule from '../models/MonthlySchedule';
import User from '../models/User';
import { nanoid } from 'nanoid';

const router = Router();

// POST /api/schedules — create/overwrite schedule
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const { examId, month, year, cyclePattern, repeatWeekly } = req.body;
        const inviteCode = nanoid(8);

        // Upsert schedule for this month/year
        const schedule = await MonthlySchedule.findOneAndUpdate(
            { userId: user._id, month, year },
            { userId: user._id, examId, month, year, cyclePattern, repeatWeekly, inviteCode },
            { upsert: true, new: true }
        );

        // Link schedule to user
        await User.findByIdAndUpdate(user._id, { scheduleId: schedule._id });
        res.status(201).json(schedule);
    } catch (err: any) {
        console.error("DEBUG SCHEDULE SAVE ERROR:", err);
        res.status(500).json({ error: 'Failed to create schedule: ' + err.message });
    }
});

// GET /api/schedules/me — get active schedule
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user?.scheduleId) { res.status(404).json({ error: 'No active schedule' }); return; }
        const schedule = await MonthlySchedule.findById(user.scheduleId).populate('examId', 'name slug');
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// GET /api/schedules/:id/days — resolve day types for full month
router.get('/:id/days', requireAuth, async (req: Request, res: Response) => {
    try {
        const schedule = await MonthlySchedule.findById(req.params.id);
        if (!schedule) { res.status(404).json({ error: 'Schedule not found' }); return; }

        const daysInMonth = new Date(schedule.year, schedule.month, 0).getDate();
        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(schedule.year, schedule.month - 1, d);
            const dow = date.getDay();
            const cycleDay = schedule.cyclePattern.find((c) => c.dayOfWeek === dow);
            days.push({ date: date.toISOString().split('T')[0], dayTypes: cycleDay?.types || ['study'], subjects: cycleDay?.subjects || [] });
        }
        res.json(days);
    } catch (err) {
        res.status(500).json({ error: 'Failed to resolve schedule days' });
    }
});

export default router;
