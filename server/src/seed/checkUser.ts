import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import MonthlySchedule from '../models/MonthlySchedule';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI as string);
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    for (const u of users) {
        console.log(`User: ${u.name} | has schedule: ${!!u.scheduleId} | ID: ${u._id}`);
        if (u.scheduleId) {
            const sched = await MonthlySchedule.findById(u.scheduleId);
            console.log(`  Schedule details: ${!!sched} | pattern history len: ${sched?.patternHistory?.length}`);
        }
    }
    process.exit(0);
}
check();
