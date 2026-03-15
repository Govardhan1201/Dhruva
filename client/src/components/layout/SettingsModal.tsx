import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Repeat, Check, BookOpen, CalendarDays } from 'lucide-react'
import { examApi, authApi, scheduleApi } from '../../lib/api'
import { useAppStore } from '../../store/appStore'
import toast from 'react-hot-toast'

const FALLBACK_EXAMS = [
    { _id: 'ca-foundation', slug: 'ca-foundation', name: 'CA Foundation', category: 'Commerce' },
    { _id: 'ca-intermediate', slug: 'ca-intermediate', name: 'CA Intermediate', category: 'Commerce' },
    { _id: 'ca-final', slug: 'ca-final', name: 'CA Final', category: 'Commerce' },
    { _id: 'jee-mains', slug: 'jee-mains', name: 'JEE Mains', category: 'Engineering' },
    { _id: 'jee-advanced', slug: 'jee-advanced', name: 'JEE Advanced', category: 'Engineering' },
    { _id: 'neet', slug: 'neet', name: 'NEET UG', category: 'Medical' },
    { _id: 'upsc-prelims', slug: 'upsc-prelims', name: 'UPSC Prelims', category: 'Civil Services' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_TYPES = ['study', 'mock', 'revision', 'catchup'] as const
const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
    study: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
    mock: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.35)' },
    revision: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)' },
    catchup: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)' },
}

interface Props {
    open: boolean
    onClose: () => void
}

export default function SettingsModal({ open, onClose }: Props) {
    const [tab, setTab] = useState<'course' | 'timetable'>('course')
    const [exams, setExams] = useState<any[]>([])
    const [selectedExam, setSelectedExam] = useState<any>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [dailyStudyHours, setDailyStudyHours] = useState(6)
    const [repeatWeekly, setRepeatWeekly] = useState(true)
    const [cyclePattern, setCyclePattern] = useState(
        DAYS.map((_, i) => ({
            dayOfWeek: i,
            types: i === 0 ? ['catchup'] : i === 6 ? ['revision'] : ['study'],
            subjects: [],
            dailyStudyHours: 6,
        }))
    )
    const [loading, setLoading] = useState(false)
    const { user, setUser, schedule, setSchedule, bumpSchedule } = useAppStore()

    // Load current settings when modal opens
    useEffect(() => {
        if (!open) return
        examApi.list()
            .then(r => setExams(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_EXAMS))
            .catch(() => setExams(FALLBACK_EXAMS))

        // Pre-fill from current user/schedule
        if (user?.examId) setSelectedExam(user.examId)
        if (schedule?.cyclePattern) {
            setCyclePattern(schedule.cyclePattern.map((c: any) => ({ ...c })))
            const firstDayHours = schedule.cyclePattern[1]?.dailyStudyHours || 6
            setDailyStudyHours(firstDayHours)
        }
        if (schedule?.repeatWeekly !== undefined) setRepeatWeekly(schedule.repeatWeekly)
    }, [open])

    useEffect(() => {
        setCyclePattern(prev => prev.map(d => ({ ...d, dailyStudyHours })))
    }, [dailyStudyHours])

    const displayExams = exams.length > 0 ? exams : FALLBACK_EXAMS
    const categories = [...new Set(displayExams.map((e: any) => e.category))]
    const filteredExams = selectedCategory
        ? displayExams.filter((e: any) => e.category === selectedCategory)
        : displayExams

    const saveCourse = async () => {
        if (!selectedExam) return
        setLoading(true)
        try {
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(selectedExam._id)
            const examId = isValidObjectId ? selectedExam._id : null
            await authApi.updateMe({ examId, examName: selectedExam.name })
            const meRes = await authApi.me()
            setUser(meRes.data)
            bumpSchedule()
            toast.success('Course updated!', { style: { background: '#111', color: '#f59e0b', border: '1px solid #222' } })
            onClose()
        } catch {
            toast.error('Failed to update course')
        } finally {
            setLoading(false)
        }
    }

    const saveTimetable = async () => {
        setLoading(true)
        try {
            // Try to update existing schedule
            const res = await scheduleApi.update({ cyclePattern, repeatWeekly })
            setSchedule(res.data)
            bumpSchedule()
            toast.success('Timetable updated!', { style: { background: '#111', color: '#f59e0b', border: '1px solid #222' } })
            onClose()
        } catch (e: any) {
            // If no schedule exists, create one
            if (e?.response?.status === 404 && user?.examId) {
                try {
                    const examId = (user.examId as any)?._id || user.examId
                    const res = await scheduleApi.create({
                        examId,
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        cyclePattern,
                        repeatWeekly,
                    })
                    setSchedule(res.data)
                    bumpSchedule()
                    toast.success('Timetable saved!', { style: { background: '#111', color: '#f59e0b', border: '1px solid #222' } })
                    onClose()
                } catch {
                    toast.error('Could not save timetable')
                }
            } else {
                toast.error('Failed to update timetable')
            }
        } finally {
            setLoading(false)
        }
    }

    const CARD: React.CSSProperties = {
        background: '#0d0f11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16,
    }
    const currentExamName = (user?.examId as any)?.name

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
                >
                    <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
                        style={{ ...CARD, width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Settings</h2>
                                <p style={{ fontSize: 13, color: '#52525b', margin: '4px 0 0' }}>Change your exam or weekly timetable</p>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 6, borderRadius: 8 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 4, padding: '20px 28px 0' }}>
                            {[
                                { id: 'course', label: 'Course', icon: BookOpen },
                                { id: 'timetable', label: 'Week Timetable', icon: CalendarDays },
                            ].map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => setTab(id as any)} style={{
                                    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                                    background: tab === id ? 'rgba(245,158,11,0.12)' : 'transparent',
                                    color: tab === id ? '#f59e0b' : '#52525b',
                                    outline: tab === id ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                                }}>
                                    <Icon size={14} /> {label}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
                            {/* ── COURSE TAB ── */}
                            {tab === 'course' && (
                                <div>
                                    {currentExamName && (
                                        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                            <span style={{ fontSize: 11, color: '#71717a' }}>Current: </span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{currentExamName}</span>
                                        </div>
                                    )}
                                    {/* Category filters */}
                                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
                                        <button onClick={() => setSelectedCategory(null)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: !selectedCategory ? '#f59e0b' : '#111113', color: !selectedCategory ? '#000' : '#71717a', border: `1px solid ${!selectedCategory ? '#f59e0b' : '#27272a'}` }}>All</button>
                                        {categories.map(cat => (
                                            <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                                style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: selectedCategory === cat ? '#f59e0b' : '#111113', color: selectedCategory === cat ? '#000' : '#71717a', border: `1px solid ${selectedCategory === cat ? '#f59e0b' : '#27272a'}` }}>{cat}</button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                                        {filteredExams.map((exam: any) => {
                                            const isSel = selectedExam?._id === exam._id || selectedExam?.slug === exam.slug
                                            return (
                                                <div key={exam._id} onClick={() => setSelectedExam(exam)} style={{ padding: 16, borderRadius: 14, cursor: 'pointer', background: isSel ? 'rgba(245,158,11,0.08)' : '#0d0f11', border: `1px solid ${isSel ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.15s' }}>
                                                    {isSel && <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}><Check size={14} color="#f59e0b" /></div>}
                                                    <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b', marginBottom: 4 }}>{exam.category}</div>
                                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{exam.name}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                        <button onClick={saveCourse} disabled={!selectedExam || loading} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: !selectedExam || loading ? 0.5 : 1 }}>
                                            {loading ? 'Saving...' : 'Save Course'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── TIMETABLE TAB ── */}
                            {tab === 'timetable' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, padding: 20, borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <Clock size={14} color="#f59e0b" />
                                                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Daily Study Goal</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <input type="range" min="1" max="14" step="0.5" value={dailyStudyHours}
                                                    onChange={e => setDailyStudyHours(Number(e.target.value))}
                                                    style={{ flex: 1, accentColor: '#f59e0b' }} />
                                                <span style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b', width: 36 }}>{dailyStudyHours}h</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <Repeat size={14} color="#f59e0b" />
                                                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Repeat Weekly</span>
                                            </div>
                                            <div onClick={() => setRepeatWeekly(!repeatWeekly)} style={{ width: 48, height: 26, borderRadius: 30, background: repeatWeekly ? '#f59e0b' : 'rgba(255,255,255,0.05)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                                                <div style={{ position: 'absolute', top: 3, left: repeatWeekly ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                        {DAY_TYPES.map(t => (
                                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE_STYLE[t].color }} />
                                                <span style={{ fontSize: 11, color: '#71717a', textTransform: 'capitalize', fontWeight: 600 }}>{t}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {DAYS.map((day, i) => {
                                            const currentTypes = cyclePattern[i]?.types as string[] || []
                                            return (
                                                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 38, fontSize: 11, fontWeight: 900, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{day}</div>
                                                    <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {DAY_TYPES.map(type => {
                                                            const isSel = currentTypes.includes(type)
                                                            return (
                                                                <button key={type}
                                                                    onClick={() => setCyclePattern(p => p.map((d, di) => {
                                                                        if (di !== i) return d
                                                                        const newTypes = isSel
                                                                            ? d.types.filter((t: string) => t !== type)
                                                                            : [...d.types, type]
                                                                        return { ...d, types: newTypes.length ? newTypes : ['study'] }
                                                                    }))}
                                                                    style={{ padding: '6px 13px', borderRadius: 7, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', border: '1px solid', cursor: 'pointer', transition: 'all 0.12s', background: isSel ? TYPE_STYLE[type].bg : 'rgba(255,255,255,0.02)', borderColor: isSel ? TYPE_STYLE[type].color : 'rgba(255,255,255,0.05)', color: isSel ? TYPE_STYLE[type].color : '#52525b' }}>
                                                                    {type}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                        <button onClick={saveTimetable} disabled={loading} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                                            {loading ? 'Saving...' : 'Save Timetable'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
