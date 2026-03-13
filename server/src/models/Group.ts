import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    scheduleId: mongoose.Types.ObjectId;
    adminId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
    name: { type: String, required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'MonthlySchedule', required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IGroup>('Group', GroupSchema);
