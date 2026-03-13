import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import Task from '../models/Task';
import DayPlan from '../models/DayPlan';
import User from '../models/User';
import { startOfDay, endOfDay, addDays, isSameWeek } from 'date-fns';

const router = Router();

// GET /api/tasks?date=YYYY-MM-DD
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const dateStr = req.query.date as string;
        const filter: any = { userId: user._id };
        if (dateStr) {
            const date = new Date(dateStr);
            const dow = date.getDay();
            // Include: tasks scheduled on this date OR recurring tasks that include this day
            const dateTasks = await Task.find({
                userId: user._id,
                scheduledDate: { $gte: startOfDay(date), $lt: endOfDay(date) },
            }).sort({ subject: 1 });

            const recurringTasks = await Task.find({
                userId: user._id,
                isRecurring: true,
                recurringDays: dow,
            }).sort({ subject: 1 });

            // Merge, avoiding duplicates
            const ids = new Set(dateTasks.map((t: any) => t._id.toString()));
            const merged = [...dateTasks, ...recurringTasks.filter((t: any) => !ids.has(t._id.toString()))];
            res.json(merged);
            return;
        }
        const tasks = await Task.find(filter).sort({ scheduledDate: 1, subject: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const taskData: any = {
            ...req.body,
            userId: user._id,
        };
        // Remove undefined/null required-ish fields
        if (!taskData.dayPlanId) delete taskData.dayPlanId;
        if (!taskData.examId) delete taskData.examId;

        const task = await Task.create(taskData);

        if (taskData.dayPlanId) {
            await DayPlan.findByIdAndUpdate(taskData.dayPlanId, { $push: { taskIds: task._id } });
        }
        res.status(201).json(task);
    } catch (err: any) {
        console.error('Task create error:', err.message);
        res.status(500).json({ error: 'Failed to create task', detail: err.message });
    }
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
    try {
        const { status, practiceMinutes } = req.body;
        const update: any = { status };
        if (status === 'completed') update.completedAt = new Date();
        if (practiceMinutes !== undefined) update.practiceMinutes = practiceMinutes;
        const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// POST /api/tasks/:id/postpone
router.post('/:id/postpone', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const now = new Date();
        const lastReset = user.lastPostponeReset || new Date(0);

        let currentPostpones = user.weeklyPostpones || 0;

        // Reset the counter if we are in a new week (weeks start on Sunday by default in date-fns)
        if (!isSameWeek(now, lastReset)) {
            currentPostpones = 0;
            user.lastPostponeReset = now;
        }

        if (currentPostpones >= 3) {
            res.status(400).json({ error: 'Weekly postpone limit (3) reached.' });
            return;
        }

        const task = await Task.findOne({ _id: req.params.id, userId: user._id });
        if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

        if (task.isRecurring) {
            res.status(400).json({ error: 'Recurring tasks cannot be postponed.' });
            return;
        }

        task.scheduledDate = addDays(task.scheduledDate, 1);
        await task.save();

        user.weeklyPostpones = currentPostpones + 1;
        await user.save();

        res.json({ task, remainingPostpones: 3 - user.weeklyPostpones });
    } catch (err: any) {
        console.error('Postpone error:', err.message);
        res.status(500).json({ error: 'Failed to postpone task' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// GET /api/tasks/recurring — list all recurring task templates
router.get('/recurring', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }
        const tasks = await Task.find({ userId: user._id, isRecurring: true }).sort({ subject: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recurring tasks' });
    }
});

export default router;
