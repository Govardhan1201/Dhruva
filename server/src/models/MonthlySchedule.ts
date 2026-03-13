import mongoose, { Schema, Document } from 'mongoose';

export type DayType = 'study' | 'mock' | 'revision' | 'catchup';

export interface ICycleDay {
    dayOfWeek: number; // 0 = Sunday
    type: DayType;
    subjects: string[];
    focusLabel?: string;
    dailyStudyHours?: number; // Target hours for this day of the week
}

export interface IMonthlySchedule extends Document {
    userId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    month: number;
    year: number;
    repeatWeekly: boolean;
    cyclePattern: ICycleDay[];
    groupId?: mongoose.Types.ObjectId;
    inviteCode?: string;
    createdAt: Date;
}

const CycleDaySchema = new Schema<ICycleDay>({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    type: { type: String, enum: ['study', 'mock', 'revision', 'catchup'], required: true },
    subjects: [String],
    focusLabel: String,
    dailyStudyHours: { type: Number, default: 3 },
});

const MonthlyScheduleSchema = new Schema<IMonthlySchedule>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'ExamConfig', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    repeatWeekly: { type: Boolean, default: true },
    cyclePattern: [CycleDaySchema],
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    inviteCode: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMonthlySchedule>('MonthlySchedule', MonthlyScheduleSchema);
