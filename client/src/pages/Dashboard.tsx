import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { taskApi, dayplanApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import {
    CheckCircle2, Circle, MinusCircle,
    Plus, Clock, Repeat,
    AlertTriangle, ChevronRight, X, Trash2, ArrowRightCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
    completed: '#10b981', partial: '#f59e0b', pending: '#52525b',
}
const STATUS_ICON: Record<string, any> = {
    completed: CheckCircle2, partial: MinusCircle, pending: Circle,
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const CARD: React.CSSProperties = {
    background: '#0d0f11',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
}
const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: '#070809', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e4e4e7', fontSize: 13, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
}
const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700, color: '#52525b',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
}

export default function Dashboard() {
    const today = new Date().toISOString().split('T')[0]
    const [tasks, setTasks] = useState<any[]>([])
    const [dayPlan, setDayPlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [showPunishment, setShowPunishment] = useState(false)
    const [form, setForm] = useState({
        subject: '', chapter: '', description: '',
        durationMinutes: 30,
        isRecurring: false,
        recurringDays: [] as number[],
    })
    const { user } = useAppStore()

    useEffect(() => { loadDay() }, [])

    const loadDay = async () => {
        setLoading(true)
        try {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
            const [dp, tk, yTk] = await Promise.all([
                dayplanApi.get(today),
                taskApi.list(today),
                taskApi.list(yesterday)
            ])
            setDayPlan(dp.data)
            setTasks(tk.data || [])

            // Check consistency punishment based on yesterday
            const yTasks = yTk.data || []
            const yTotal = yTasks.length
            const yDone = yTasks.filter((t: any) => t.status === 'completed').length
            if (yTotal > 0 && (yDone / yTotal) < 0.75) {
                setShowPunishment(true)
            }
        } catch { }
        setLoading(false)
    }

    const postponeTask = async (id: string, isRecurring: boolean) => {
        if (isRecurring) {
            toast.error('Recurring tasks cannot be postponed')
            return
        }
        try {
            const res = await taskApi.postpone(id)
            setTasks(p => p.filter(t => t._id !== id)) // remove from today
            toast.success(`Postponed! ${res.data.remainingPostpones} left this week.`)
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Cannot postpone anymore this week')
        }
    }

    const cycleStatus = async (task: any) => {
        const order = ['pending', 'partial', 'completed']
        const next = order[(order.indexOf(task.status) + 1) % order.length]
        try {
            await taskApi.updateStatus(task._id, next)
            setTasks(p => p.map(t => t._id === task._id ? { ...t, status: next } : t))
        } catch { toast.error('Could not update') }
    }

    const deleteTask = async (id: string) => {
        try {
            await taskApi.delete(id)
            setTasks(p => p.filter(t => t._id !== id))
            toast.success('Task deleted')
        } catch { toast.error('Could not delete') }
    }

    const addTask = async () => {
        if (!form.description.trim()) return
        try {
            const payload: any = {
                subject: form.subject || 'General',
                chapter: form.chapter,
                description: form.description,
                durationMinutes: form.durationMinutes,
                scheduledDate: today,
                isRecurring: form.isRecurring,
                isCatchup: false,
            }
            if (form.isRecurring && form.recurringDays.length > 0) {
                payload.recurringDays = form.recurringDays
            }
            if (dayPlan?._id) payload.dayPlanId = dayPlan._id
            const examId = (user?.examId as any)?._id || user?.examId
            if (examId) payload.examId = examId

            const res = await taskApi.create(payload)
            setTasks(p => [...p, res.data])
            setForm({ subject: '', chapter: '', description: '', durationMinutes: 30, isRecurring: false, recurringDays: [] })
            setShowAdd(false)
            toast.success('Task added!', { style: { background: '#111', color: '#f59e0b', border: '1px solid #222' } })
        } catch (e: any) {
            toast.error('Failed to add task: ' + (e?.response?.data?.detail || e?.response?.data?.error || ''))
        }
    }

    const toggleDay = (d: number) => {
        setForm(p => ({
            ...p,
            recurringDays: p.recurringDays.includes(d)
                ? p.recurringDays.filter(x => x !== d)
                : [...p.recurringDays, d],
        }))
    }

    // Stats
    const done = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

    // Daily target from Schedule constraints
    const targetMins = dayPlan?.targetStudyHours ? dayPlan.targetStudyHours * 60 : 0
    const scheduledMins = tasks.reduce((a, t) => a + (t.durationMinutes || 0), 0)
    const doneMins = tasks.filter(t => t.status === 'completed').reduce((a, t) => a + (t.durationMinutes || 0), 0)

    const studyPct = targetMins > 0 ? Math.min(100, Math.round((doneMins / targetMins) * 100)) : 0
    const neededMins = Math.max(0, targetMins - scheduledMins)

    const grouped = tasks.reduce((acc: any, t: any) => {
        const key = t.subject || 'General'
        if (!acc[key]) acc[key] = []
        acc[key].push(t)
        return acc
    }, {})

    const fmtMins = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'Inter, sans-serif' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h1>
                    <p style={{ fontSize: 13, color: '#52525b', margin: '5px 0 0' }}>
                        {(user?.examId as any)?.name
                            ? `Preparing for ${(user?.examId as any).name}`
                            : 'Your study day'}
                    </p>
                </div>
                {dayPlan?.dayType && (
                    <div style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        background: dayPlan.dayType === 'catchup' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: dayPlan.dayType === 'catchup' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${dayPlan.dayType === 'catchup' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>
                        {dayPlan.dayType} Day
                    </div>
                )}
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {/* Daily target (sum of task durations) */}
                <div style={{ ...CARD, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Clock size={13} color="#f59e0b" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            Daily Target
                        </span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '-0.03em' }}>
                        {fmtMins(doneMins)}
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#3f3f46' }}> / {fmtMins(targetMins || 180)}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${studyPct}%` }} transition={{ duration: 1 }}
                            style={{ height: '100%', background: '#f59e0b', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#52525b', marginTop: 6 }}>
                        {neededMins > 0 ? `Schedule ${fmtMins(neededMins)} more to meet target` : 'Daily target scheduled!'}
                    </div>
                </div>

                {/* Tasks done */}
                <div style={{ ...CARD, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Tasks Done</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                        {done}<span style={{ fontSize: 18, color: '#3f3f46', fontWeight: 500 }}>/{tasks.length}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', marginTop: 14 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                            style={{ height: '100%', background: '#10b981', borderRadius: 4 }} />
                    </div>
                </div>

                {/* Pending */}
                <div style={{ ...CARD, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Pending</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: pending > 0 ? '#f87171' : '#10b981', letterSpacing: '-0.03em' }}>
                        {pending}
                    </div>
                    <div style={{ fontSize: 11, color: '#52525b', marginTop: 14 }}>
                        {pending > 0 ? `${pending} task${pending > 1 ? 's' : ''} remaining` : '🎉 All clear today!'}
                    </div>
                </div>
            </div>

            {/* ── Pending banner ── */}
            {pending > 0 && dayPlan?.dayType !== 'catchup' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ ...CARD, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: '#fca5a5', flex: 1, margin: 0 }}>
                        {pending} task{pending > 1 ? 's' : ''} still pending — they'll appear on your next Catchup day.
                    </p>
                    <ChevronRight size={14} color="#f87171" />
                </motion.div>
            )}

            {/* ── Daily Target Warning ── */}
            {neededMins > 0 && dayPlan?.dayType !== 'catchup' && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', padding: '14px 20px', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <AlertTriangle size={18} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fca5a5', marginBottom: 4 }}>Daily Target Not Met</div>
                        <div style={{ fontSize: 12, color: '#f87171', lineHeight: 1.5 }}>
                            You still need to schedule <strong>{fmtMins(neededMins)}</strong> of tasks to hit your {dayPlan?.targetStudyHours || 3} hour target for today.
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Tasks section ── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Today's Tasks</h2>
                    <button onClick={() => setShowAdd(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                        <Plus size={14} /> Add Task
                    </button>
                </div>

                {/* ── Add Task Modal ── */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
                                style={{ ...CARD, width: '100%', maxWidth: 520, padding: 28, display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '92vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Add Task</h3>
                                        <p style={{ fontSize: 12, color: '#52525b', margin: '4px 0 0' }}>Tasks with time set your daily target</p>
                                    </div>
                                    <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', padding: 6, borderRadius: 8, flexShrink: 0 }}>
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Subject + Chapter */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={lbl}>Subject</label>
                                        <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                            placeholder="e.g. Physics" style={inp} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Chapter / Topic</label>
                                        <input value={form.chapter} onChange={e => setForm(p => ({ ...p, chapter: e.target.value }))}
                                            placeholder="e.g. Kinematics" style={inp} />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={lbl}>Task Description *</label>
                                    <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="What do you need to study or practice?" style={inp} />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label style={lbl}>
                                        <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
                                        Time Needed (minutes) — counts towards daily target
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="number" min={5} step={5} value={form.durationMinutes}
                                            onChange={e => setForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
                                            style={{ ...inp, width: 100 }} />
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {[15, 30, 45, 60, 90, 120].map(m => (
                                                <button key={m} onClick={() => setForm(p => ({ ...p, durationMinutes: m }))}
                                                    style={{
                                                        padding: '6px 10px', borderRadius: 8, border: '1px solid',
                                                        borderColor: form.durationMinutes === m ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                                                        background: form.durationMinutes === m ? 'rgba(245,158,11,0.1)' : 'transparent',
                                                        color: form.durationMinutes === m ? '#f59e0b' : '#52525b',
                                                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                    }}>
                                                    {m < 60 ? `${m}m` : `${m / 60}h`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recurring toggle */}
                                <div>
                                    <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
                                        <div onClick={() => setForm(p => ({ ...p, isRecurring: !p.isRecurring, recurringDays: !p.isRecurring ? [] : [] }))}
                                            style={{
                                                width: 34, height: 20, borderRadius: 20, position: 'relative', cursor: 'pointer', flexShrink: 0,
                                                background: form.isRecurring ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                                                transition: 'background 0.2s',
                                            }}>
                                            <div style={{
                                                position: 'absolute', top: 2, left: form.isRecurring ? 16 : 2,
                                                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                            }} />
                                        </div>
                                        <Repeat size={10} style={{ display: 'inline' }} />
                                        <span>Weekly Recurring Task</span>
                                    </label>
                                    {form.isRecurring && (
                                        <div style={{ marginTop: 10 }}>
                                            <p style={{ fontSize: 11, color: '#52525b', marginBottom: 8 }}>Which days should this task appear?</p>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {DAYS.map((d, i) => (
                                                    <button key={i} onClick={() => toggleDay(i)}
                                                        style={{
                                                            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                            border: `1px solid ${form.recurringDays.includes(i) ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                                            background: form.recurringDays.includes(i) ? 'rgba(245,158,11,0.1)' : 'transparent',
                                                            color: form.recurringDays.includes(i) ? '#f59e0b' : '#52525b',
                                                        }}>
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                            {form.recurringDays.length === 0 && (
                                                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>Select at least one day</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Preview */}
                                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>Preview</div>
                                    <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                                        <span style={{ fontWeight: 700, color: '#e4e4e7' }}>{form.description || 'Your task'}</span>
                                        {' '}· {fmtMins(form.durationMinutes)}
                                        {form.isRecurring && form.recurringDays.length > 0 &&
                                            ` · Repeats ${form.recurringDays.map(d => DAYS[d]).join(', ')}`}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowAdd(false)}
                                        style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'transparent', color: '#71717a', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button onClick={addTask} disabled={!form.description.trim() || (form.isRecurring && form.recurringDays.length === 0)}
                                        style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: (!form.description.trim() || (form.isRecurring && form.recurringDays.length === 0)) ? 0.5 : 1 }}>
                                        Save Task
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Task groups */}
                {Object.keys(grouped).length === 0 ? (
                    <div style={{ ...CARD, padding: '60px 32px', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <CheckCircle2 size={28} color="#3f3f46" />
                        </div>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>No tasks yet!</p>
                        <p style={{ fontSize: 13, color: '#52525b', margin: '0 0 24px' }}>Add tasks — the total time becomes your daily target.</p>
                        <button onClick={() => setShowAdd(true)}
                            style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                            Add First Task
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {Object.entries(grouped).map(([subject, stasks]: any, gi) => (
                            <motion.div key={subject} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.06 }}
                                style={{ ...CARD, overflow: 'hidden' }}>
                                {/* Subject header */}
                                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#e4e4e7' }}>{subject}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, color: '#52525b' }}>
                                            ⏱ {fmtMins(stasks.reduce((a: number, t: any) => a + (t.durationMinutes || 0), 0))}
                                        </span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#52525b', background: '#111113', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 20 }}>
                                            {stasks.filter((t: any) => t.status === 'completed').length}/{stasks.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Tasks */}
                                {stasks.map((task: any, ti: number) => {
                                    const Icon = STATUS_ICON[task.status]
                                    const isDone = task.status === 'completed'
                                    return (
                                        <div key={task._id} style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '14px 20px',
                                            borderBottom: ti < stasks.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                            background: isDone ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.08)',
                                            borderLeft: isDone ? '3px solid #10b981' : '3px solid #ef4444',
                                        }}>
                                            <button onClick={() => cycleStatus(task)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                                                <Icon size={20} color={STATUS_COLOR[task.status]} />
                                            </button>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: isDone ? '#52525b' : '#d4d4d8', margin: 0, textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {task.description}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                                    {task.chapter && <span style={{ fontSize: 11, color: '#3f3f46' }}>{task.chapter}</span>}
                                                    {task.isRecurring && (
                                                        <span style={{ fontSize: 10, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>
                                                            <Repeat size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />WEEKLY
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginRight: 6 }}>
                                                    <Clock size={11} color="#52525b" />
                                                    <span style={{ fontSize: 11, color: '#52525b', fontWeight: 600 }}>{fmtMins(task.durationMinutes || 0)}</span>
                                                </div>
                                                {!isDone && !task.isRecurring && (
                                                    <button onClick={() => postponeTask(task._id, task.isRecurring)}
                                                        title="Postpone to tomorrow"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3f3f46', padding: 4, borderRadius: 6 }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f59e0b'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#3f3f46'}>
                                                        <ArrowRightCircle size={15} />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteTask(task._id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3f3f46', padding: 4, borderRadius: 6 }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#3f3f46'}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Consistency Punishment Modal ── */}
            <AnimatePresence>
                {showPunishment && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                        <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
                            style={{ ...CARD, width: '100%', maxWidth: 400, padding: 32, textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)', background: 'linear-gradient(180deg, rgba(239,68,68,0.1) 0%, rgba(13,15,17,1) 100%)' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <AlertTriangle size={32} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fca5a5', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                                Consistency Warning!
                            </h3>
                            <p style={{ fontSize: 14, color: '#e4e4e7', margin: '0 0 16px', lineHeight: 1.6 }}>
                                Your task completion ratio yesterday fell below <strong>75%</strong>. Disclipline is the bridge between goals and accomplishment.
                            </p>
                            <div style={{ background: 'rgba(239,68,68,0.15)', padding: '16px', borderRadius: 12, marginBottom: 24, border: '1px dashed rgba(239,68,68,0.3)' }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Punishment for Today</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>No Social Media allowed today.</div>
                            </div>
                            <button onClick={() => setShowPunishment(false)}
                                style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                I accept the consequence
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
