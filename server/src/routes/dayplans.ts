import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import DayPlan from '../models/DayPlan';
import Task from '../models/Task';
import User from '../models/User';
import MonthlySchedule from '../models/MonthlySchedule';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const router = Router();

// GET /api/dayplans/:date
router.get('/:date', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const date = new Date(req.params.date as string);
        let dayPlan: any = await DayPlan.findOne({
            userId: user._id,
            date: { $gte: startOfDay(date), $lte: endOfDay(date) },
        }).populate('taskIds').populate('catchupTaskIds');

        if (!dayPlan && user.scheduleId) {
            const schedule = await MonthlySchedule.findById(user.scheduleId);
            if (schedule) {
                const dow = date.getDay();
                const cycleDay = schedule.cyclePattern.find((c) => c.dayOfWeek === dow);
                dayPlan = await DayPlan.create({
                    userId: user._id,
                    scheduleId: user.scheduleId,
                    date,
                    dayTypes: cycleDay?.types || ['study'],
                    taskIds: [],
                    catchupTaskIds: [],
                    practiceLog: [],
                    targetStudyHours: (cycleDay as any)?.dailyStudyHours || 3,
                });
            }
        }

        // Fallback synthetic plan if no schedule yet (new users)
        if (!dayPlan) {
            dayPlan = {
                _id: null,
                date: date.toISOString(),
                dayTypes: ['study'],
                targetStudyHours: 3,
                practiceLog: [],
                taskIds: [],
                catchupTaskIds: [],
            };
        }

        res.json(dayPlan);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch day plan' });
    }
});

// PATCH /api/dayplans/:id/log — update practice log
router.patch('/:id/log', requireAuth, async (req: Request, res: Response) => {
    try {
        const { practiceLog, notes } = req.body;
        const dayPlan = await DayPlan.findByIdAndUpdate(
            req.params.id,
            { practiceLog, notes },
            { new: true }
        );
        res.json(dayPlan);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update practice log' });
    }
});

// POST /api/dayplans/:id/generate-catchup
router.post('/:id/generate-catchup', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const dayPlan = await DayPlan.findById(req.params.id);
        if (!dayPlan) { res.status(404).json({ error: 'Day plan not found' }); return; }

        const sevenDaysAgo = subDays(dayPlan.date, 7);
        const pendingTasks = await Task.find({
            userId: user._id,
            status: { $in: ['pending', 'partial'] },
            scheduledDate: { $gte: startOfDay(sevenDaysAgo), $lt: startOfDay(dayPlan.date) },
            isCatchup: false,
        });

        const catchupIds = pendingTasks.map((t) => t._id);
        await Task.updateMany({ _id: { $in: catchupIds } }, { isCatchup: true });

        const updated = await DayPlan.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { catchupTaskIds: { $each: catchupIds } } },
            { new: true }
        ).populate('catchupTaskIds');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate catchup' });
    }
});

export default router;
