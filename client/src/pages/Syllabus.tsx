import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyticsApi, examApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string }> = {
    completed: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },
    partial: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b' },
    'not started': { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', text: '#52525b' },
    'needs revision': { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', text: '#06b6d4' },
}

function Ring({ pct, color = '#f59e0b' }: { pct: number; color?: string }) {
    const r = 22, circ = 2 * Math.PI * r
    return (
        <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
            <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
            <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
                strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
                strokeLinecap="round"
                transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x={28} y={33} textAnchor="middle" fontSize={11} fontWeight={800} fill={pct > 0 ? color : '#3f3f46'}>{pct}%</text>
        </svg>
    )
}

export default function Syllabus() {
    const [examData, setExamData] = useState<any>(null)
    const [progress, setProgress] = useState<any[]>([])
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const { user } = useAppStore()

    useEffect(() => {
        if (!user?.examId) { setLoading(false); return }
        const examId = (user.examId as any)._id || user.examId
        const slug = (user.examId as any).slug
        Promise.all([
            examApi.get(slug || examId),
            analyticsApi.syllabusProgress(),
        ]).then(([eR, pR]) => {
            setExamData(eR.data)
            setProgress(pR.data)
        }).catch(() => { }).finally(() => setLoading(false))
    }, [user])

    const getChChapter = (subject: string, chapter: string) => {
        const f = progress.find(p => p.subject === subject && p.chapter === chapter)
        if (!f) return { status: 'not started', pct: 0 }
        if (f.percentage >= 100) return { status: 'completed', pct: 100 }
        if (f.percentage > 0) return { status: 'partial', pct: f.percentage }
        return { status: 'not started', pct: 0 }
    }

    const getSubjectPct = (subject: any) => {
        let total = 0, done = 0
        for (const unit of subject.units || []) {
            for (const ch of unit.chapters || []) {
                total++
                done += getChChapter(subject.name, ch.name).pct / 100
            }
        }
        return total > 0 ? Math.round((done / total) * 100) : 0
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div className="w-9 h-9 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
    )

    if (!examData) return (
        <div style={{ padding: 64, textAlign: 'center', background: '#0d0f11', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)' }}>
            <BookOpen size={36} color="#3f3f46" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>No exam selected</p>
            <p style={{ fontSize: 13, color: '#52525b', margin: 0 }}>Complete onboarding to see your syllabus</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'Inter, sans-serif', paddingBottom: 48 }}>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{examData.name}</h1>
                    <p style={{ fontSize: 13, color: '#52525b', margin: '6px 0 0' }}>
                        {examData.subjects?.length || 0} subjects · Track your chapter progress
                    </p>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_STYLE).map(([s, v]) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.text }} />
                            <span style={{ fontSize: 11, color: '#71717a', textTransform: 'capitalize' }}>{s}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subjects */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {examData.subjects?.map((subject: any, si: number) => {
                    const pct = getSubjectPct(subject)
                    const open = expanded[subject.name]
                    const color = subject.color || '#f59e0b'
                    return (
                        <motion.div key={subject.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: si * 0.05 }}
                            style={{ background: '#0d0f11', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                            {/* Subject header row */}
                            <button onClick={() => setExpanded(p => ({ ...p, [subject.name]: !open }))}
                                style={{
                                    width: '100%', padding: '18px 24px', display: 'flex', alignItems: 'center',
                                    gap: 18, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <Ring pct={pct} color={color} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 17, fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.01em' }}>{subject.name}</div>
                                    <div style={{ fontSize: 11, color: '#52525b', marginTop: 3 }}>
                                        {subject.units?.length || 0} units · {subject.units?.reduce((a: number, u: any) => a + (u.chapters?.length || 0), 0)} chapters
                                    </div>
                                </div>
                                {open ? <ChevronUp size={16} color="#52525b" /> : <ChevronDown size={16} color="#52525b" />}
                            </button>

                            {/* Expanded unit list */}
                            {open && (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {subject.units?.map((unit: any) => {
                                        const unitDone = (unit.chapters || []).filter((ch: any) =>
                                            getChChapter(subject.name, ch.name).status === 'completed').length
                                        const unitPct = unit.chapters?.length > 0 ? Math.round((unitDone / unit.chapters.length) * 100) : 0

                                        return (
                                            <div key={unit.name}>
                                                {/* Unit name + mini progress bar */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa' }}>{unit.name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 64, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                                                            <div style={{ width: `${unitPct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                                                        </div>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color, width: 30, textAlign: 'right' }}>{unitPct}%</span>
                                                    </div>
                                                </div>
                                                {/* Chapter chips */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {(unit.chapters || []).map((ch: any) => {
                                                        const { status } = getChChapter(subject.name, ch.name)
                                                        const style = STATUS_STYLE[status]
                                                        return (
                                                            <div key={ch.name} title={ch.name}
                                                                style={{
                                                                    padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                                    background: style.bg, border: `1px solid ${style.border}`, color: style.text,
                                                                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                    cursor: 'default',
                                                                }}>
                                                                {ch.name}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
