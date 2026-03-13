import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { Plus, X, ChevronDown, ChevronUp, Trophy, TrendingUp, BookOpen, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_TYPES = ['full', 'chapter', 'previous-year']

const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: '#070809', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e4e4e7', fontSize: 13, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
}
const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700, color: '#52525b',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
}
const CARD: React.CSSProperties = {
    background: '#0d0f11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16,
}

export default function MockTests() {
    const [mocks, setMocks] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [form, setForm] = useState({
        title: '', type: 'full',
        date: new Date().toISOString().split('T')[0],
        totalMarks: 100, scored: 0, timeTakenMinutes: 180,
        chaptersCovered: '', notes: '',
    })
    const { user } = useAppStore()

    useEffect(() => { load() }, [])

    const load = async () => {
        setLoading(true)
        try { const r = await mockApi.list(); setMocks(r.data) } catch { }
        setLoading(false)
    }

    const submit = async () => {
        if (!form.title) return
        try {
            await mockApi.create({
                ...form,
                examId: (user?.examId as any)?._id || user?.examId,
                chaptersCovered: form.chaptersCovered.split(',').map(s => s.trim()).filter(Boolean),
                subjectBreakdown: [],
            })
            toast.success('Mock recorded!', { style: { background: '#111', color: '#f59e0b', border: '1px solid #222' } })
            setShowForm(false)
            setForm({ title: '', type: 'full', date: new Date().toISOString().split('T')[0], totalMarks: 100, scored: 0, timeTakenMinutes: 180, chaptersCovered: '', notes: '' })
            load()
        } catch { toast.error('Failed to save') }
    }

    const pct = (m: any) => Math.round((m.scored / m.totalMarks) * 100)
    const pctColor = (p: number) => p >= 75 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444'
    const pctLabel = (p: number) => p >= 75 ? 'Great' : p >= 50 ? 'Good' : 'Needs Work'
    const avgPct = mocks.length > 0 ? Math.round(mocks.reduce((a, m) => a + pct(m), 0) / mocks.length) : 0
    const best = mocks.length > 0 ? Math.max(...mocks.map(pct)) : 0

    const scorePct = form.totalMarks > 0 ? Math.round((form.scored / form.totalMarks) * 100) : 0

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: 'Inter, sans-serif', paddingBottom: 48 }}>

            {/* ── RECORD FORM MODAL ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ ...CARD, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
                            {/* Modal header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 28 }}>
                                <div>
                                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Record Mock Score</h3>
                                    <p style={{ fontSize: 12, color: '#52525b', margin: '4px 0 0' }}>You can log a mock from any day</p>
                                </div>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', padding: 6, borderRadius: 8, flexShrink: 0 }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {/* Title */}
                                <div>
                                    <label style={lbl}>Mock Title</label>
                                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="E.g. JEE Mains Full Test #3" style={inp} />
                                </div>
                                {/* Type + Date */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={lbl}>Type</label>
                                        <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                            style={{ ...inp, cursor: 'pointer' }}>
                                            {MOCK_TYPES.map(t => <option key={t} value={t} style={{ background: '#0d0f11' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={lbl}>Date Taken</label>
                                        <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                            style={{ ...inp, colorScheme: 'dark' }} />
                                    </div>
                                </div>
                                {/* Marks */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={lbl}>Total Marks</label>
                                        <input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: Number(e.target.value) }))} style={inp} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Scored</label>
                                        <input type="number" value={form.scored} onChange={e => setForm(p => ({ ...p, scored: Number(e.target.value) }))} style={inp} />
                                    </div>
                                </div>
                                {/* Time taken */}
                                <div>
                                    <label style={lbl}>Time Taken (minutes)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="number" value={form.timeTakenMinutes} onChange={e => setForm(p => ({ ...p, timeTakenMinutes: Number(e.target.value) }))} style={{ ...inp, flex: 1 }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#52525b', whiteSpace: 'nowrap', fontSize: 12 }}>
                                            <Clock size={13} /> minutes
                                        </div>
                                    </div>
                                </div>
                                {/* Chapters */}
                                <div>
                                    <label style={lbl}>Chapters Covered <span style={{ textTransform: 'none', fontWeight: 400 }}>(comma separated)</span></label>
                                    <input value={form.chaptersCovered} onChange={e => setForm(p => ({ ...p, chaptersCovered: e.target.value }))}
                                        placeholder="Ch 1, Kinematics, Thermodynamics…" style={inp} />
                                </div>
                                {/* Notes */}
                                <div>
                                    <label style={lbl}>Notes <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                                    <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                        placeholder="What went wrong? What to revise…" rows={2}
                                        style={{ ...inp, resize: 'none', lineHeight: 1.6 }} />
                                </div>

                                {/* Live score preview */}
                                {form.totalMarks > 0 && (
                                    <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: `1px solid ${pctColor(scorePct)}25`, display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 900,
                                            background: pctColor(scorePct) + '15',
                                            border: `2px solid ${pctColor(scorePct)}30`,
                                            color: pctColor(scorePct),
                                        }}>
                                            {scorePct}%
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{pctLabel(scorePct)}</div>
                                            <div style={{ fontSize: 12, color: '#52525b' }}>{form.scored} out of {form.totalMarks} marks</div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                                    <button onClick={() => setShowForm(false)}
                                        style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'transparent', color: '#71717a', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button onClick={submit} disabled={!form.title}
                                        style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: form.title ? 1 : 0.5 }}>
                                        Save Mock
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Mock Tests</h1>
                    <p style={{ fontSize: 13, color: '#52525b', margin: '6px 0 0' }}>
                        {mocks.length > 0 ? `${mocks.length} attempt${mocks.length > 1 ? 's' : ''} recorded` : 'Record & review your scores'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowForm(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        <Plus size={14} /> Record Score
                    </button>
                </div>
            </div>

            {/* ── STATS ── */}
            {mocks.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { icon: Trophy, label: 'Best Score', value: `${best}%`, color: '#f59e0b' },
                        { icon: TrendingUp, label: 'Average', value: `${avgPct}%`, color: avgPct >= 60 ? '#10b981' : '#f59e0b' },
                        { icon: BookOpen, label: 'Total Mocks', value: `${mocks.length}`, color: '#a78bfa' },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} style={{ ...CARD, padding: '20px 24px' }}>
                            <Icon size={15} color={color} style={{ marginBottom: 10 }} />
                            <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── HISTORY ── */}
            <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>History</h2>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
                        <div className="w-9 h-9 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    </div>
                ) : mocks.length === 0 ? (
                    <div style={{ ...CARD, padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={28} color="#3f3f46" />
                        </div>
                        <div>
                            <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>No mock tests yet</p>
                            <p style={{ fontSize: 13, color: '#52525b', margin: '0 0 24px', maxWidth: 280 }}>
                                Record any mock you take — whether it's a scheduled test day or not!
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowForm(true)}
                                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                                Record Score
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {mocks.map((mock, i) => {
                            const p = pct(mock)
                            const isOpen = expanded === mock._id
                            return (
                                <motion.div key={mock._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    style={{ ...CARD, overflow: 'hidden' }}>
                                    <button onClick={() => setExpanded(isOpen ? null : mock._id)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                        <div style={{
                                            width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 900,
                                            background: pctColor(p) + '12', border: `2px solid ${pctColor(p)}28`, color: pctColor(p),
                                        }}>
                                            {p}%
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mock.title}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 11, color: '#52525b' }}>
                                                    {new Date(mock.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span style={{ color: '#3f3f46', fontSize: 10 }}>·</span>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#71717a' }}>{mock.scored}/{mock.totalMarks} marks</span>
                                                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em', background: pctColor(p) + '15', color: pctColor(p) }}>
                                                    {pctLabel(p)}
                                                </span>
                                                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: '#71717a', textTransform: 'capitalize' }}>
                                                    {mock.type}
                                                </span>
                                            </div>
                                        </div>
                                        {isOpen ? <ChevronUp size={16} color="#52525b" /> : <ChevronDown size={16} color="#3f3f46" />}
                                    </button>
                                    {isOpen && mock.subjectBreakdown?.length > 0 && (
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '18px 22px' }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Subject Breakdown</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                                {mock.subjectBreakdown.map((sb: any) => {
                                                    const sp = sb.total > 0 ? Math.round((sb.scored / sb.total) * 100) : 0
                                                    return (
                                                        <div key={sb.subject} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                            <span style={{ fontSize: 12, color: '#a1a1aa' }}>{sb.subject}</span>
                                                            <span style={{ fontSize: 12, fontWeight: 800, color: pctColor(sp) }}>{sb.scored}/{sb.total}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {isOpen && mock.notes && (
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '14px 22px' }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Notes</p>
                                            <p style={{ fontSize: 12, color: '#71717a', margin: 0, lineHeight: 1.6 }}>{mock.notes}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
