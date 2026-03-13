import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/clerkAuth';
import User from '../models/User';
import Task from '../models/Task';
import MockTest from '../models/MockTest';
import DayPlan from '../models/DayPlan';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const router = Router();

// GET /api/analytics/heatmap?days=90
router.get('/heatmap', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const days = Number(req.query.days) || 90;
        const since = subDays(new Date(), days);

        const dayPlans = await DayPlan.find({ userId: user._id, date: { $gte: since } });
        const heatmap = dayPlans.map((dp) => ({
            date: dp.date.toISOString().split('T')[0],
            minutes: dp.practiceLog.reduce((sum, l) => sum + l.minutes, 0),
        }));
        res.json(heatmap);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate heatmap' });
    }
});

// GET /api/analytics/scores
router.get('/scores', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const mocks = await MockTest.find({ userId: user._id }).sort({ date: 1 }).limit(30);
        const scores = mocks.map((m) => ({
            date: m.date.toISOString().split('T')[0],
            title: m.title,
            type: m.type,
            percentage: Math.round((m.scored / m.totalMarks) * 100),
        }));
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

// GET /api/analytics/subject-accuracy
router.get('/subject-accuracy', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const mocks = await MockTest.find({ userId: user._id });
        const subjectMap: Record<string, { scored: number; total: number }> = {};

        for (const mock of mocks) {
            for (const sb of mock.subjectBreakdown) {
                if (!subjectMap[sb.subject]) subjectMap[sb.subject] = { scored: 0, total: 0 };
                subjectMap[sb.subject].scored += sb.scored;
                subjectMap[sb.subject].total += sb.total;
            }
        }

        const result = Object.entries(subjectMap).map(([subject, v]) => ({
            subject,
            scored: v.scored,
            total: v.total,
            accuracy: v.total > 0 ? Math.round((v.scored / v.total) * 100) : 0,
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to compute subject accuracy' });
    }
});

// GET /api/analytics/weak-chapters
router.get('/weak-chapters', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const mocks = await MockTest.find({ userId: user._id });
        const chapterMap: Record<string, { scored: number; total: number; attempts: number }> = {};

        for (const mock of mocks) {
            for (const chapter of mock.chaptersCovered) {
                if (!chapterMap[chapter]) chapterMap[chapter] = { scored: 0, total: 0, attempts: 0 };
                chapterMap[chapter].attempts++;
                // Distribute score proportionally
                const perChapter = mock.totalMarks / (mock.chaptersCovered.length || 1);
                chapterMap[chapter].total += perChapter;
                chapterMap[chapter].scored += (mock.scored / mock.totalMarks) * perChapter;
            }
        }

        const weakChapters = Object.entries(chapterMap)
            .map(([chapter, v]) => ({
                chapter,
                accuracy: v.total > 0 ? Math.round((v.scored / v.total) * 100) : 0,
                attempts: v.attempts,
            }))
            .filter((c) => c.accuracy < 50 && c.attempts >= 2)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 10);

        res.json(weakChapters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to detect weak chapters' });
    }
});

// GET /api/analytics/syllabus-progress
router.get('/syllabus-progress', requireAuth, async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).userId;
        const user = await User.findOne({ clerkId }).populate('examId');
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const tasks = await Task.find({ userId: user._id });
        const chapterStatusMap: Record<string, { completed: number; total: number }> = {};

        for (const task of tasks) {
            const key = `${(task as any).subject}|||${(task as any).chapter}`;
            if (!chapterStatusMap[key]) chapterStatusMap[key] = { completed: 0, total: 0 };
            chapterStatusMap[key].total++;
            if ((task as any).status === 'completed') chapterStatusMap[key].completed++;
        }

        const progress = Object.entries(chapterStatusMap).map(([key, v]) => {
            const [subject, chapter] = key.split('|||');
            const pct = v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0;
            return { subject, chapter, completed: v.completed, total: v.total, percentage: pct };
        });
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch syllabus progress' });
    }
});

export default router;
