import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach Clerk token to every request
api.interceptors.request.use(async (config) => {
    try {
        // @ts-ignore – window.__clerk set by ClerkProvider
        const token = await window.Clerk?.session?.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { }
    return config;
});

export default api;

// Typed API helpers
export const examApi = {
    list: () => api.get('/exams'),
    get: (slug: string) => api.get(`/exams/${slug}`),
};

export const authApi = {
    me: () => api.get('/auth/me'),
    updateMe: (data: any) => api.patch('/auth/me', data),
};

export const scheduleApi = {
    create: (data: any) => api.post('/schedules', data),
    me: () => api.get('/schedules/me'),
    days: (id: string) => api.get(`/schedules/${id}/days`),
};

export const dayplanApi = {
    get: (date: string) => api.get(`/dayplans/${date}`),
    updateLog: (id: string, data: any) => api.patch(`/dayplans/${id}/log`, data),
    generateCatchup: (id: string) => api.post(`/dayplans/${id}/generate-catchup`, {}),
};

export const taskApi = {
    list: (date?: string) => api.get('/tasks', { params: { date } }),
    create: (data: any) => api.post('/tasks', data),
    updateStatus: (id: string, status: string, practiceMinutes?: number) =>
        api.patch(`/tasks/${id}/status`, { status, practiceMinutes }),
    delete: (id: string) => api.delete(`/tasks/${id}`),
    postpone: (id: string) => api.post(`/tasks/${id}/postpone`),
};

export const mockApi = {
    list: () => api.get('/mocks'),
    get: (id: string) => api.get(`/mocks/${id}`),
    create: (data: any) => api.post('/mocks', data),
    delete: (id: string) => api.delete(`/mocks/${id}`),
};

export const groupApi = {
    create: (data: any) => api.post('/groups', data),
    join: (code: string) => api.post(`/groups/join/${code}`, {}),
    leaderboard: (id: string) => api.get(`/groups/${id}/leaderboard`),
};

export const analyticsApi = {
    heatmap: (days?: number) => api.get('/analytics/heatmap', { params: { days } }),
    scores: () => api.get('/analytics/scores'),
    subjectAccuracy: () => api.get('/analytics/subject-accuracy'),
    weakChapters: () => api.get('/analytics/weak-chapters'),
    syllabusProgress: () => api.get('/analytics/syllabus-progress'),
};
