import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    clerkId: string;
    name: string;
    email: string;
    avatar?: string;
    examId?: mongoose.Types.ObjectId;
    scheduleId?: mongoose.Types.ObjectId;
    groupIds: mongoose.Types.ObjectId[];
    friends: mongoose.Types.ObjectId[];
    weeklyPostpones: number;
    lastPostponeReset: Date;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: String,
    examId: { type: Schema.Types.ObjectId, ref: 'ExamConfig' },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'MonthlySchedule' },
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    weeklyPostpones: { type: Number, default: 0 },
    lastPostponeReset: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
