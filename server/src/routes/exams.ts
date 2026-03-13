import { Router, Request, Response } from 'express';
import ExamConfig from '../models/ExamConfig';

const router = Router();

// GET /api/exams
router.get('/', async (_req: Request, res: Response) => {
    try {
        const exams = await ExamConfig.find({}, 'name slug category description');
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// GET /api/exams/:slug
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const exam = await ExamConfig.findOne({ slug: req.params.slug });
        if (!exam) { res.status(404).json({ error: 'Exam not found' }); return; }
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
});

export default router;
