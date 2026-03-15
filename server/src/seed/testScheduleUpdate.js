require("dotenv").config();
const mongoose = require("mongoose");
const MonthlySchedule = require("../dist/models/MonthlySchedule").default;

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // find any schedule
    const sched = await MonthlySchedule.findOne({});
    if (!sched) return console.log("No schedule found");
    
    const update = {
        $push: {
            patternHistory: {
                changedAt: new Date(),
                cyclePattern: sched.cyclePattern
            }
        },
        cyclePattern: sched.cyclePattern
    };
    
    try {
        const res = await MonthlySchedule.findByIdAndUpdate(sched._id, update, { new: true });
        console.log("Success!", !!res);
    } catch(err) {
        console.error("Failed:", err.message);
    }
    
    process.exit(0);
}
test();
