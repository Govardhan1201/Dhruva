# Dhruva — The North Star of Exam Prep 🌟

Dhruva is a complete accountability and productivity platform designed specifically for Indian competitive exam aspirants (CA, JEE, NEET, & UPSC). Built to keep navigators on course, Dhruva ensures you master your syllabus, crush your daily tasks, and compete alongside friends.

## 🚀 Features

- **Smart Scheduling**: Generate an infinite 7-day repeating cycle with auto-catchup days for missed tasks.
- **Monthly Calendar**: Project your custom timetable forward onto a visual month-grid.
- **Strict Daily Targets**: Only fully completed tasks count towards your daily study goal.
- **Consistency Punishment**: Fall below a 75% completion ratio? Face the Consistency Penalty next time you log in.
- **PYQ Mock Tests**: Built-in MCQ mock generator from previous year question banks with active score tracking.
- **Deep Analytics**: 30-day activity heatmaps, rolling score trends, and automatic weak-chapter detection.
- **Study Groups**: Invite friends, compete on live leaderboards, and compare daily scores side-by-side.
- **3D Interactive UI**: Modern, un-distracting Framer Motion tilt cards, scroll parallax, and smooth route transitions.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (Global state management)
- **Framer Motion** (3D tilt, parallax, and micro-interactions)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose** (Database)
- **Clerk** (Authentication & Webhooks)
- **date-fns** (Strict date and timezone handling)

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Clerk API Keys

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Govardhan1201/Dhruva.git
   cd Dhruva
   ```

2. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables:**
   - In `client/`, create a `.env.local` file with your `VITE_CLERK_PUBLISHABLE_KEY`.
   - In `server/`, create a `.env` file with your `MONGODB_URI` and Clerk secret keys.

4. **Run the development servers:**
   ```bash
   # In the client folder
   npm run dev

   # In the server folder 
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.

## Link To Access the Website
https://dhruva-five.vercel.app/
