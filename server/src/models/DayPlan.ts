import mongoose, { Schema, Document } from 'mongoose';
import { DayType } from './MonthlySchedule';

export interface IPracticeLog {
    subject: string;
    minutes: number;
}

export interface IDayPlan extends Document {
    userId: mongoose.Types.ObjectId;
    scheduleId: mongoose.Types.ObjectId;
    date: Date;
    dayType: DayType;
    taskIds: mongoose.Types.ObjectId[];
    catchupTaskIds: mongoose.Types.ObjectId[];
    practiceLog: IPracticeLog[];
    targetStudyHours?: number;
    notes?: string;
    createdAt: Date;
}

const PracticeLogSchema = new Schema<IPracticeLog>({ subject: String, minutes: Number });

const DayPlanSchema = new Schema<IDayPlan>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'MonthlySchedule', required: true },
    date: { type: Date, required: true },
    dayType: { type: String, enum: ['study', 'mock', 'revision', 'catchup'], required: true },
    taskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    catchupTaskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    practiceLog: [PracticeLogSchema],
    targetStudyHours: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now },
});

DayPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDayPlan>('DayPlan', DayPlanSchema);
