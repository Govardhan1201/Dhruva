import mongoose, { Schema } from 'mongoose';

export type TaskStatus = 'pending' | 'completed' | 'partial';

const TaskSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dayPlanId: { type: Schema.Types.ObjectId, ref: 'DayPlan', required: false },
    examId: { type: Schema.Types.ObjectId, ref: 'ExamConfig', required: false },
    subject: { type: String, default: 'General' },
    chapter: { type: String, default: '' },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'partial'], default: 'pending' },
    scheduledDate: { type: Date, required: true },
    completedAt: { type: Date },
    isCatchup: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 30 },   // planned study time
    practiceMinutes: { type: Number, default: 0 },    // actual time logged
    isRecurring: { type: Boolean, default: false }, // weekly recurring
    recurringDays: { type: [Number], default: undefined }, // 0=Sun…6=Sat
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: false,
});

TaskSchema.index({ userId: 1, scheduledDate: 1 });
TaskSchema.index({ userId: 1, isRecurring: 1 });

export default mongoose.model('Task', TaskSchema);
