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

        const { examId, examName, month, year, cyclePattern, repeatWeekly } = req.body;
        const inviteCode = nanoid(8);

        // Build the update object — only include examId if it was provided and valid
        const scheduleData: any = {
            userId: user._id,
            month,
            year,
            cyclePattern,
            repeatWeekly,
            inviteCode,
            // Start with an empty patternHistory — this is the very first pattern
            patternHistory: [{ changedAt: new Date(), cyclePattern }],
        };
        if (examId) scheduleData.examId = examId;
        if (examName) scheduleData.examName = examName;

        // Upsert schedule for this month/year
        const schedule = await MonthlySchedule.findOneAndUpdate(
            { userId: user._id, month, year },
            scheduleData,
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

            // Use patternHistory to resolve which cyclePattern was active on this date
            const pattern = resolvePatternForDate(date, schedule);
            const cycleDay = pattern.find((c) => c.dayOfWeek === dow);
            days.push({ date: date.toISOString().split('T')[0], dayTypes: cycleDay?.types || ['study'], subjects: cycleDay?.subjects || [] });
        }
        res.json(days);
    } catch (err) {
        res.status(500).json({ error: 'Failed to resolve schedule days' });
    }
});

// PATCH /api/schedules/me — update active schedule (timetable / exam)
router.patch('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user?.scheduleId) { res.status(404).json({ error: 'No active schedule to update' }); return; }

        const { cyclePattern, repeatWeekly, examId, examName } = req.body;
        const update: any = {};
        if (repeatWeekly !== undefined) update.repeatWeekly = repeatWeekly;
        if (examId !== undefined) update.examId = examId;
        if (examName !== undefined) update.examName = examName;

        if (cyclePattern !== undefined) {
            // Save old pattern to history before overwriting
            const current = await MonthlySchedule.findById(user.scheduleId);
            if (current) {
                update.$push = {
                    patternHistory: {
                        changedAt: new Date(),
                        cyclePattern: current.cyclePattern,
                    },
                };
            }
            update.cyclePattern = cyclePattern;
        }

        const schedule = await MonthlySchedule.findByIdAndUpdate(
            user.scheduleId,
            update,
            { new: true }
        );

        // Also update examId/examName on the user if provided
        const userUpdate: any = {};
        if (examId !== undefined) userUpdate.examId = examId;
        if (examName !== undefined) userUpdate.examName = examName;
        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(user._id, userUpdate);
        }

        res.json(schedule);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to update schedule: ' + err.message });
    }
});

/**
 * Given a date and a schedule document, return the cyclePattern that was active
 * on that date, using patternHistory.
 *
 * patternHistory is sorted [oldest, ..., newest]. Each entry's `changedAt` is the
 * date when THAT pattern became active (i.e. the previous entry was active before that).
 *
 * The current `schedule.cyclePattern` is the one active from the LAST history entry onwards.
 *
 * Logic: find the LAST patternHistory entry whose `changedAt` <= the given date.
 * That entry's cyclePattern was the active one on that date.
 * If no history entry applies, fall back to schedule.cyclePattern.
 */
function resolvePatternForDate(date: Date, schedule: any): any[] {
    const history: { changedAt: Date; cyclePattern: any[] }[] = schedule.patternHistory || [];

    // Sort by changedAt ascending (oldest first)
    const sorted = [...history].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

    let activePattern = schedule.cyclePattern; // default to current

    // The last entry in patternHistory was the pattern BEFORE the current one changed.
    // So we walk backward from newest to find the snapshot that was active ON this date.
    // A snapshot at index i was the active pattern from sorted[i].changedAt to sorted[i+1].changedAt.
    // The current pattern is active from sorted[last].changedAt onwards.
    //
    // So: if date < sorted[0].changedAt → use sorted[0].cyclePattern (initial snapshot)
    //     if sorted[i].changedAt <= date < sorted[i+1].changedAt → use sorted[i+1].cyclePattern
    //     if date >= sorted[last].changedAt → use schedule.cyclePattern (current)

    if (sorted.length === 0) return schedule.cyclePattern;

    const dateMs = date.getTime();

    // If date is before the very first snapshot's changedAt, use that first snapshot
    if (dateMs < new Date(sorted[0].changedAt).getTime()) {
        return sorted[0].cyclePattern;
    }

    // Walk forward — the current pattern applies from the LAST snapshot's changedAt
    for (let i = 0; i < sorted.length - 1; i++) {
        const from = new Date(sorted[i].changedAt).getTime();
        const to = new Date(sorted[i + 1].changedAt).getTime();
        if (dateMs >= from && dateMs < to) {
            // This date falls in the window where sorted[i+1] was the new pattern
            return sorted[i + 1].cyclePattern;
        }
    }

    // Date is >= last snapshot changedAt — use current pattern
    return activePattern;
}

export { resolvePatternForDate };
export default router;
