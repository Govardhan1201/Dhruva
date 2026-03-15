import mongoose, { Schema, Document } from 'mongoose';

export type DayType = 'study' | 'mock' | 'revision' | 'catchup';

export interface ICycleDay {
    dayOfWeek: number; // 0 = Sunday
    types: DayType[];
    subjects: string[];
    focusLabel?: string;
    dailyStudyHours?: number;
}

export interface IPatternSnapshot {
    changedAt: Date;        // when this pattern became active
    cyclePattern: ICycleDay[];
}

export interface IMonthlySchedule extends Document {
    userId: mongoose.Types.ObjectId;
    examId?: mongoose.Types.ObjectId;   // optional — fallback exam users won't have this
    examName?: string;                  // always set — display name
    month: number;
    year: number;
    repeatWeekly: boolean;
    cyclePattern: ICycleDay[];          // current (latest) pattern
    patternHistory: IPatternSnapshot[]; // snapshot of every previous pattern with when it changed
    groupId?: mongoose.Types.ObjectId;
    inviteCode?: string;
    createdAt: Date;
}

const CycleDaySchema = new Schema<ICycleDay>({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    types: [{ type: String, enum: ['study', 'mock', 'revision', 'catchup'] }],
    subjects: [String],
    focusLabel: String,
    dailyStudyHours: { type: Number, default: 3 },
});

const PatternSnapshotSchema = new Schema<IPatternSnapshot>({
    changedAt: { type: Date, required: true },
    cyclePattern: [CycleDaySchema],
});

const MonthlyScheduleSchema = new Schema<IMonthlySchedule>({
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId:        { type: Schema.Types.ObjectId, ref: 'ExamConfig' },   // NOT required
    examName:      { type: String },
    month:         { type: Number, required: true },
    year:          { type: Number, required: true },
    repeatWeekly:  { type: Boolean, default: true },
    cyclePattern:  [CycleDaySchema],
    patternHistory:[PatternSnapshotSchema],
    groupId:       { type: Schema.Types.ObjectId, ref: 'Group' },
    inviteCode:    { type: String, unique: true, sparse: true },
    createdAt:     { type: Date, default: Date.now },
});

export default mongoose.model<IMonthlySchedule>('MonthlySchedule', MonthlyScheduleSchema);
