import 'dotenv/config';
import mongoose from 'mongoose';
import ExamConfig from '../models/ExamConfig';
import { examPresets } from './examPresets';

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dhruva');
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await ExamConfig.deleteMany({});
    console.log('🗑️  Cleared existing exam configs');

    // Insert exams
    const inserted = await ExamConfig.insertMany(examPresets);
    console.log(`✅ Inserted ${inserted.length} exam configs`);

    await mongoose.disconnect();
    console.log('🎉 Seed complete');
}

seed().catch((e) => { console.error(e); process.exit(1); });
