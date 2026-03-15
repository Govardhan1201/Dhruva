require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../dist/models/User").default;
const MonthlySchedule = require("../dist/models/MonthlySchedule").default;

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
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
check().catch(e => console.error(e));
