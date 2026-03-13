import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectScore {
    subject: string;
    scored: number;
    total: number;
}

export interface IMockTest extends Document {
    userId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    type: 'chapter' | 'full' | 'pyq';
    title: string;
    date: Date;
    totalMarks: number;
    scored: number;
    timeTakenMinutes?: number;
    subjectBreakdown: ISubjectScore[];
    chaptersCovered: string[];
    pyqYear?: number;
    notes?: string;
    createdAt: Date;
}

const SubjectScoreSchema = new Schema<ISubjectScore>({
    subject: String,
    scored: Number,
    total: Number,
});

const MockTestSchema = new Schema<IMockTest>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'ExamConfig', required: true },
    type: { type: String, enum: ['chapter', 'full', 'pyq'], required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    scored: { type: Number, required: true },
    timeTakenMinutes: Number,
    subjectBreakdown: [SubjectScoreSchema],
    chaptersCovered: [String],
    pyqYear: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now },
});

MockTestSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IMockTest>('MockTest', MockTestSchema);
