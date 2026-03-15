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
    scheduleVersion: number;
    isLoading: boolean;
    setUser: (u: UserProfile | null) => void;
    setSchedule: (s: Schedule | null) => void;
    bumpSchedule: () => void;
    setLoading: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: null,
    schedule: null,
    scheduleVersion: 0,
    isLoading: false,
    setUser: (user) => set({ user }),
    setSchedule: (schedule) => set({ schedule }),
    bumpSchedule: () => set((state) => ({ scheduleVersion: state.scheduleVersion + 1 })),
    setLoading: (isLoading) => set({ isLoading }),
}));
