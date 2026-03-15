"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: String,
    examId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamConfig' },
    examName: { type: String },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MonthlySchedule' },
    groupIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Group' }],
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    weeklyPostpones: { type: Number, default: 0 },
    lastPostponeReset: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('User', UserSchema);
