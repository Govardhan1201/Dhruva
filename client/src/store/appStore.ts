import { create } from 'zustand';

interface UserProfile {
    _id: string;
    clerkId: string;
    name: string;
    email: string;
    avatar?: string;
    examId?: { _id: string; name: string; slug: string; category: string };
    scheduleId?: string;
    groupIds: string[];
    createdAt?: string;
}

interface Schedule {
    _id: string;
    month: number;
    year: number;
    cyclePattern: any[];
    repeatWeekly: boolean;
    examId: { name: string; slug: string };
    inviteCode: string;
}

interface AppState {
    user: UserProfile | null;
    schedule: Schedule | null;
    isLoading: boolean;
    setUser: (u: UserProfile | null) => void;
    setSchedule: (s: Schedule | null) => void;
    setLoading: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: null,
    schedule: null,
    isLoading: false,
    setUser: (user) => set({ user }),
    setSchedule: (schedule) => set({ schedule }),
    setLoading: (isLoading) => set({ isLoading }),
}));
