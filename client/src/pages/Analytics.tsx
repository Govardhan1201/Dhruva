import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyticsApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from 'recharts'
import { AlertCircle, TrendingUp, Target, BookOpen } from 'lucide-react'
import { format, subDays } from 'date-fns'

const S = {
    card: {
        background: '#0d0f11',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 24,
    } as React.CSSProperties,
    sectionGap: { display: 'flex', flexDirection: 'column', gap: 24 } as React.CSSProperties,
}

export default function Analytics() {
    const [heatmap, setHeatmap] = useState<any[]>([])
    const [scores, setScores] = useState<any[]>([])
    const [accuracy, setAccuracy] = useState<any[]>([])
    const [weakChapters, setWeakChapters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAppStore()

    useEffect(() => {
        if (!user) return
        Promise.all([
            analyticsApi.heatmap(90),
            analyticsApi.scores(),
            analyticsApi.subjectAccuracy(),
            analyticsApi.weakChapters(),
        ]).then(([hR, sR, aR, wR]) => {
            setHeatmap(hR.data)
            setScores(sR.data)
            setAccuracy(aR.data)
            setWeakChapters(wR.data)
        }).catch(() => { }).finally(() => setLoading(false))
    }, [user])

    const today = new Date()
    const days = Array.from({ length: 84 }).map((_, i) => {
        const d = subDays(today, 83 - i)
        const dateStr = format(d, 'yyyy-MM-dd')
        const found = heatmap.find(h => h.date === dateStr)
        return { date: dateStr, minutes: found?.minutes || 0 }
    })
    const getHeatColor = (m: number) => {
        if (m === 0) return 'rgba(255,255,255,0.04)'
        if (m < 60) return '#78350f'
        if (m < 120) return '#b45309'
        if (m < 240) return '#d97706'
        return '#f59e0b'
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div className="w-9 h-9 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
    )

    return (
        <div style={{ ...S.sectionGap, fontFamily: 'Inter, sans-serif', paddingBottom: 48 }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Analytics</h1>
                <p style={{ fontSize: 13, color: '#52525b', margin: '6px 0 0' }}>Insights into your study patterns and performance</p>
            </div>

            {/* Heatmap */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Target size={14} color="#f59e0b" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#e4e4e7' }}>12-Week Study Heatmap</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 560 }}>
                        {/* Month labels */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8, marginBottom: 8 }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} style={{ fontSize: 10, color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {format(subDays(today, (11 - i) * 7), 'MMM')}
                                </div>
                            ))}
                        </div>
                        {/* Grid */}
                        <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: 3 }}>
                            {days.map(d => (
                                <div key={d.date} title={`${d.date}: ${d.minutes}m`}
                                    style={{ width: 14, height: 14, borderRadius: 3, background: getHeatColor(d.minutes), cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                            ))}
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12 }}>
                            <span style={{ fontSize: 10, color: '#52525b' }}>Less</span>
                            {[0, 30, 90, 150, 250].map(m => (
                                <div key={m} style={{ width: 12, height: 12, borderRadius: 2, background: getHeatColor(m) }} />
                            ))}
                            <span style={{ fontSize: 10, color: '#52525b' }}>More</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Score trend */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...S.card, height: 300, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <TrendingUp size={14} color="#38bdf8" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#e4e4e7' }}>Mock Score Trend</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        {scores.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scores} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
                                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10}
                                        tickFormatter={s => { try { return format(new Date(s), 'MMM d') } catch { return s } }} />
                                    <YAxis stroke="#3f3f46" fontSize={10} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #27272a', borderRadius: 10, fontSize: 12 }} />
                                    <Line type="monotone" dataKey="percentage" stroke="#38bdf8" strokeWidth={2.5}
                                        dot={{ r: 4, fill: '#38bdf8' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <BookOpen size={28} color="#3f3f46" />
                                <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>No mock scores yet. Take a mock test!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Subject accuracy */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ ...S.card, height: 300, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <Target size={14} color="#10b981" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#e4e4e7' }}>Subject Accuracy</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        {accuracy.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={accuracy} layout="vertical" margin={{ top: 4, right: 8, bottom: 20, left: 50 }}>
                                    <XAxis type="number" domain={[0, 100]} stroke="#3f3f46" fontSize={10} />
                                    <YAxis dataKey="subject" type="category" stroke="#3f3f46" fontSize={10} width={90}
                                        tickFormatter={s => s.slice(0, 10) + (s.length > 10 ? '…' : '')} />
                                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #27272a', borderRadius: 10, fontSize: 12 }}
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="accuracy" radius={[0, 5, 5, 0]}>
                                        {accuracy.map((e, i) => (
                                            <Cell key={i} fill={e.accuracy >= 75 ? '#10b981' : e.accuracy >= 50 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <Target size={28} color="#3f3f46" />
                                <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>Record mock tests to see accuracy</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Weak chapters */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <AlertCircle size={14} color="#f87171" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#e4e4e7' }}>Weak Chapter Detector</span>
                </div>
                {weakChapters.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {weakChapters.map((wk, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 18px', borderRadius: 12,
                                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)',
                            }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', margin: '0 0 3px' }}>{wk.chapter}</p>
                                    <p style={{ fontSize: 11, color: '#52525b', margin: 0 }}>Tested {wk.attempts} times</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 22, fontWeight: 900, color: '#f87171', margin: '0 0 2px' }}>{wk.accuracy}%</p>
                                    <p style={{ fontSize: 10, color: '#52525b', margin: 0 }}>Avg Score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '24px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', textAlign: 'center' }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#10b981', margin: '0 0 6px' }}>No weak chapters detected yet!</p>
                        <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>Complete more mock tests to see pattern analysis.</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
