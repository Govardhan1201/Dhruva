"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CycleDaySchema = new mongoose_1.Schema({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    types: [{ type: String, enum: ['study', 'mock', 'revision', 'catchup'] }],
    subjects: [String],
    focusLabel: String,
    dailyStudyHours: { type: Number, default: 3 },
});
var PatternSnapshotSchema = new mongoose_1.Schema({
    changedAt: { type: Date, required: true },
    cyclePattern: [CycleDaySchema],
});
var MonthlyScheduleSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamConfig' }, // NOT required
    examName: { type: String },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    repeatWeekly: { type: Boolean, default: true },
    cyclePattern: [CycleDaySchema],
    patternHistory: [PatternSnapshotSchema],
    groupId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Group' },
    inviteCode: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('MonthlySchedule', MonthlyScheduleSchema);
