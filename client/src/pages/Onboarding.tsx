import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { examApi, authApi, scheduleApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { ChevronRight, Clock, Repeat, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const FALLBACK_EXAMS = [
    { _id: 'ca-foundation', slug: 'ca-foundation', name: 'CA Foundation', category: 'Commerce', description: 'Accounting, Business Laws, Economics & Quantitative Aptitude' },
    { _id: 'ca-intermediate', slug: 'ca-intermediate', name: 'CA Intermediate', category: 'Commerce', description: 'Advanced Accounting, Tax, Cost Accounting, Law & Audit' },
    { _id: 'ca-final', slug: 'ca-final', name: 'CA Final', category: 'Commerce', description: 'SFM, Strategy, Law, Audit, ISCA, Tax & Elective' },
    { _id: 'jee-mains', slug: 'jee-mains', name: 'JEE Mains', category: 'Engineering', description: 'Physics, Chemistry, Mathematics' },
    { _id: 'jee-advanced', slug: 'jee-advanced', name: 'JEE Advanced', category: 'Engineering', description: 'Deep problem solving in PCM for IIT admissions' },
    { _id: 'neet', slug: 'neet', name: 'NEET UG', category: 'Medical', description: 'Physics, Chemistry, Biology' },
    { _id: 'upsc-prelims', slug: 'upsc-prelims', name: 'UPSC Prelims', category: 'Civil Services', description: 'GS Paper I & CSAT for IAS/IPS aspirants' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_TYPES = ['study', 'mock', 'revision', 'catchup'] as const
const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
    study: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
    mock: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.35)' },
    revision: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)' },
    catchup: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)' },
}

export default function Onboarding() {
    const [step, setStep] = useState(0)
    const [exams, setExams] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedExam, setSelectedExam] = useState<any>(null)
    const [dailyStudyHours, setDailyStudyHours] = useState(3)
    const [repeatWeekly, setRepeatWeekly] = useState(true)
    const [cyclePattern, setCyclePattern] = useState(
        DAYS.map((_, i) => ({
            dayOfWeek: i,
            types: i === 0 ? ['catchup'] : i === 6 ? ['revision'] : ['study'],
            subjects: [],
            dailyStudyHours: 3,
        }))
    )
    const [loading, setLoading] = useState(false)
    const nav = useNavigate()
    const { setUser, setSchedule } = useAppStore()

    useEffect(() => {
        examApi.list()
            .then(r => setExams(Array.isArray(r.data) && r.data.length > 0 ? r.data : FALLBACK_EXAMS))
            .catch(() => setExams(FALLBACK_EXAMS))
    }, [])

    useEffect(() => {
        setCyclePattern(prev => prev.map(d => ({ ...d, dailyStudyHours })))
    }, [dailyStudyHours])

    const displayExams = exams.length > 0 ? exams : FALLBACK_EXAMS
    const categories = [...new Set(displayExams.map((e: any) => e.category))]
    const filteredExams = selectedCategory ? displayExams.filter((e: any) => e.category === selectedCategory) : displayExams

    const handleFinish = async () => {
        if (!selectedExam) return
        setLoading(true)
        try {
            // Check if the examId is a valid 24-char MongoDB ObjectId. If it's a fallback string like 'ca-foundation', send null to unset it.
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(selectedExam._id);
            const payloadExamId = isValidObjectId ? selectedExam._id : null;

            // Always save the exam name so it displays correctly after re-login
            await authApi.updateMe({ examId: payloadExamId, examName: selectedExam.name })
            const meRes = await authApi.me()
            setUser(meRes.data)
            
            const schedRes = await scheduleApi.create({
                examId: payloadExamId,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                cyclePattern,
                repeatWeekly,
            })
            setSchedule(schedRes.data)
            toast.success('Welcome to Dhruva! 🎉', { style: { background: '#111', color: '#f59e0b', border: '1px solid #222' } })
            nav('/dashboard')
        } catch (e: any) {
            const msg = e.response?.data?.error || 'Could not save. Please check your connection.';
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#070809', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
            {/* ── SIDEBAR ── */}
            <aside style={{ width: 280, flexShrink: 0, background: '#0c0e10', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fbbf24', fontSize: 16, fontWeight: 900 }}>✦</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Dhruva</div>
                        <div style={{ fontSize: 10, color: '#52525b', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Study Tracker</div>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { num: 1, label: 'Choose Your Exam', desc: 'Select what you\'re preparing for' },
                        { num: 2, label: 'Design Timetable', desc: 'Set your weekly study cycle' },
                    ].map((s, i) => {
                        const current = step === i
                        const done = step > i
                        return (
                            <div key={s.num} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16, borderRadius: 16, transition: 'all 0.2s',
                                background: current ? 'rgba(245,158,11,0.07)' : 'transparent',
                                border: `1px solid ${current ? 'rgba(245,158,11,0.18)' : 'transparent'}`
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 900, flexShrink: 0,
                                    background: done ? '#10b981' : current ? '#f59e0b' : '#1c1c1f',
                                    color: done || current ? '#000' : '#52525b',
                                }}>
                                    {done ? <Check size={14} /> : s.num}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: current ? '#fff' : done ? '#a1a1aa' : '#52525b' }}>{s.label}</div>
                                    <div style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>{s.desc}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {selectedExam && (
                    <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Selected</p>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                            <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedExam.name}</p>
                            <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedExam.category}</p>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── MAIN FLUID CONTENT ── */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '60px 48px' }}>
                <div style={{ width: '100%', maxWidth: 900 }}> {/* WIDER MAX-WIDTH */}
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div>
                                    <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Choose your path</h1>
                                    <p style={{ fontSize: 14, color: '#71717a', margin: '8px 0 0' }}>What are you preparing for? We'll personalise everything around your exam.</p>
                                </div>

                                {/* Category Filters */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28, marginBottom: 24 }}>
                                    <button onClick={() => setSelectedCategory(null)}
                                        style={{
                                            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                                            background: !selectedCategory ? '#f59e0b' : '#111113', color: !selectedCategory ? '#000' : '#71717a',
                                            border: `1px solid ${!selectedCategory ? '#f59e0b' : '#27272a'}`
                                        }}>All</button>
                                    {categories.map(cat => (
                                        <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                            style={{
                                                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                                                background: selectedCategory === cat ? '#f59e0b' : '#111113', color: selectedCategory === cat ? '#000' : '#71717a',
                                                border: `1px solid ${selectedCategory === cat ? '#f59e0b' : '#27272a'}`
                                            }}>{cat}</button>
                                    ))}
                                </div>

                                {/* Exam Grid - 3 columns for better desktop use */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                    {filteredExams.map((exam: any) => {
                                        const isSelected = selectedExam?._id === exam._id
                                        return (
                                            <div key={exam._id} onClick={() => setSelectedExam(exam)}
                                                style={{
                                                    padding: 24, borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s',
                                                    background: isSelected ? 'rgba(245,158,11,0.08)' : '#0d0f11',
                                                    border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                                                }}>
                                                <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#52525b', marginBottom: 8 }}>{exam.category}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{exam.name}</div>
                                                <div style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>{exam.description}</div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
                                    <button onClick={() => setStep(1)} disabled={!selectedExam}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 14, border: 'none',
                                            background: '#f59e0b', color: '#000', fontSize: 14, fontWeight: 900, letterSpacing: '0.05em', cursor: 'pointer',
                                            opacity: selectedExam ? 1 : 0.5
                                        }}>
                                        CONTINUE <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div>
                                    <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Design your week</h1>
                                    <p style={{ fontSize: 14, color: '#71717a', margin: '8px 0 0' }}>Set your daily goal and assign a type to each day.</p>
                                </div>

                                <div style={{ marginTop: 32, background: '#0d0f11', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 32 }}>
                                    {/* Settings row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <Clock size={16} color="#f59e0b" />
                                                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Daily Study Goal</span>
                                            </div>
                                            <p style={{ fontSize: 12, color: '#52525b', margin: '0 0 16px 26px' }}>Hours target per day</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 26 }}>
                                                <input type="range" min="1" max="14" step="0.5" value={dailyStudyHours}
                                                    onChange={e => setDailyStudyHours(Number(e.target.value))}
                                                    style={{ flex: 1, accentColor: '#f59e0b' }} />
                                                <span style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b', width: 40 }}>{dailyStudyHours}h</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <Repeat size={16} color="#f59e0b" />
                                                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Repeat Weekly</span>
                                            </div>
                                            <p style={{ fontSize: 12, color: '#52525b', margin: '0 0 16px 26px' }}>Same pattern every week</p>
                                            <div style={{ paddingLeft: 26 }}>
                                                <div onClick={() => setRepeatWeekly(!repeatWeekly)}
                                                    style={{
                                                        width: 52, height: 28, borderRadius: 30, background: repeatWeekly ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                                                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                                                    }}>
                                                    <div style={{
                                                        position: 'absolute', top: 3, left: repeatWeekly ? 27 : 3,
                                                        width: 22, height: 22, borderRadius: '50%', background: '#fff',
                                                        transition: 'left 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timetable planner */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                        {DAY_TYPES.map(type => (
                                            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_STYLE[type].color }} />
                                                <span style={{ fontSize: 11, color: '#71717a', textTransform: 'capitalize', fontWeight: 600 }}>{type}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {DAYS.map((day, i) => {
                                            const currentTypes = cyclePattern[i].types as string[]
                                            return (
                                                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 40, fontSize: 12, fontWeight: 900, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{day}</div>
                                                    <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                        {DAY_TYPES.map(type => {
                                                            const isSel = currentTypes.includes(type)
                                                            return (
                                                                <button key={type}
                                                                    onClick={() => setCyclePattern(p => p.map((d, di) => {
                                                                        if (di !== i) return d;
                                                                        const newTypes = isSel
                                                                            ? d.types.filter(t => t !== type)
                                                                            : [...d.types, type];
                                                                        return { ...d, types: newTypes.length ? newTypes : ['study'] }
                                                                    }))}
                                                                    style={{
                                                                        padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                                                                        background: isSel ? TYPE_STYLE[type].bg : 'rgba(255,255,255,0.02)',
                                                                        borderColor: isSel ? TYPE_STYLE[type].color : 'rgba(255,255,255,0.05)',
                                                                        color: isSel ? TYPE_STYLE[type].color : '#52525b',
                                                                    }}>{type}</button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderRadius: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', marginTop: 32 }}>
                                        <span style={{ fontSize: 16 }}>💡</span>
                                        <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>
                                            <span style={{ color: '#f59e0b', fontWeight: 800 }}>Catchup days</span> automatically pick up all unfinished tasks from the past 7 days, so you never permanently fall behind.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
                                    <button onClick={() => setStep(0)}
                                        style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                        &lt; BACK
                                    </button>
                                    <button onClick={handleFinish} disabled={loading}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 14, border: 'none',
                                            background: '#f59e0b', color: '#000', fontSize: 14, fontWeight: 900, letterSpacing: '0.05em', cursor: 'pointer',
                                            opacity: loading ? 0.5 : 1
                                        }}>
                                        {loading ? 'SAVING...' : 'LAUNCH DHRUVA'} <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
