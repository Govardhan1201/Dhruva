import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter {
    name: string;
    weightage?: number;
}

export interface IUnit {
    name: string;
    chapters: IChapter[];
}

export interface ISubject {
    name: string;
    color?: string;
    units: IUnit[];
}

export interface IExamConfig extends Document {
    name: string;
    slug: string;
    category: 'CA' | 'JEE' | 'NEET' | 'UPSC' | 'OTHER';
    description?: string;
    subjects: ISubject[];
    createdAt: Date;
}

const ChapterSchema = new Schema<IChapter>({ name: String, weightage: Number });
const UnitSchema = new Schema<IUnit>({ name: String, chapters: [ChapterSchema] });
const SubjectSchema = new Schema<ISubject>({ name: String, color: String, units: [UnitSchema] });

const ExamConfigSchema = new Schema<IExamConfig>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, enum: ['CA', 'JEE', 'NEET', 'UPSC', 'OTHER'], required: true },
    description: String,
    subjects: [SubjectSchema],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IExamConfig>('ExamConfig', ExamConfigSchema);
