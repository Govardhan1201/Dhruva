import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import DayPlan from '../models/DayPlan';
import Task from '../models/Task';
import User from '../models/User';
import MonthlySchedule from '../models/MonthlySchedule';
import { resolvePatternForDate } from './schedules';
import { subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO, isBefore } from 'date-fns';

const router = Router();

// GET /api/dayplans/range?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns { date, dayTypes, completionStatus } for each calendar day
router.get('/range', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const startStr = req.query.start as string;
        const endStr = req.query.end as string;
        if (!startStr || !endStr) { res.status(400).json({ error: 'start and end query params required' }); return; }

        const startDate = parseISO(startStr);
        const endDate = parseISO(endStr);
        const today = startOfDay(new Date());

        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        // Fetch all tasks in that range
        const tasks = await Task.find({
            userId: user._id,
            scheduledDate: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) },
        });

        // Group tasks by date string
        const tasksByDate: Record<string, any[]> = {};
        tasks.forEach((t: any) => {
            const key = new Date(t.scheduledDate).toISOString().split('T')[0];
            if (!tasksByDate[key]) tasksByDate[key] = [];
            tasksByDate[key].push(t);
        });

        // Fetch DayPlans to get dayTypes
        const dayPlans = await DayPlan.find({
            userId: user._id,
            date: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) },
        });
        const dayPlanByDate: Record<string, any> = {};
        dayPlans.forEach((dp: any) => {
            const key = new Date(dp.date).toISOString().split('T')[0];
            dayPlanByDate[key] = dp;
        });

        // Load full schedule (including patternHistory) once
        let schedule: any = null;
        if (user.scheduleId) {
            schedule = await MonthlySchedule.findById(user.scheduleId);
        }

        const result = allDays.map((day) => {
            const key = day.toISOString().split('T')[0];
            const isPast = isBefore(startOfDay(day), today);
            const dayPlan = dayPlanByDate[key];
            const dayTasks = tasksByDate[key] || [];

            // Resolve dayTypes from DayPlan or schedule patternHistory
            let dayTypes: string[] = ['study'];
            if (dayPlan?.dayTypes?.length) {
                dayTypes = dayPlan.dayTypes;
            } else if (schedule) {
                const pattern = resolvePatternForDate(day, schedule);
                const dow = day.getDay();
                const cyc = pattern.find((c: any) => c.dayOfWeek === dow);
                if (cyc?.types?.length) dayTypes = cyc.types;
            }

            // Compute completion status — only meaningful for past days
            let completionStatus: 'full' | 'partial' | 'none' | 'future' = 'future';
            if (isPast) {
                if (dayTasks.length === 0) {
                    completionStatus = 'none';
                } else {
                    const done = dayTasks.filter((t: any) => t.status === 'completed').length;
                    const partial = dayTasks.filter((t: any) => t.status === 'partial').length;
                    if (done === dayTasks.length) completionStatus = 'full';
                    else if (done > 0 || partial > 0) completionStatus = 'partial';
                    else completionStatus = 'none';
                }
            }

            return { date: key, dayTypes, completionStatus };
        });

        res.json(result);
    } catch (err: any) {
        console.error('Range dayplans error:', err);
        res.status(500).json({ error: 'Failed to fetch range' });
    }
});

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
                // Use historically-correct pattern for this specific date
                const pattern = resolvePatternForDate(date, schedule);
                const dow = date.getDay();
                const cycleDay = pattern.find((c: any) => c.dayOfWeek === dow);
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
