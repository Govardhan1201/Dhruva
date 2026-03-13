import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { scheduleApi } from '../lib/api'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle, Calendar as CalendarIcon, ClipboardCheck } from 'lucide-react'

// Map day types to visual styles
const TYPE_STYLES: Record<string, { bg: string, border: string, text: string, icon: any }> = {
    study: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#34d399', icon: BookOpen },
    catchup: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b', icon: AlertCircle },
    mock: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#a78bfa', icon: ClipboardCheck },
    revision: { bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.2)', text: '#38bdf8', icon: BookOpen },
}

export default function CalendarView() {
    const [schedule, setSchedule] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    useEffect(() => {
        scheduleApi.me()
            .then(res => setSchedule(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const dates = eachDayOfInterval({ start: startDate, end: endDate })

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.1)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    }

    if (!schedule) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CalendarIcon size={32} color="#f59e0b" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12 }}>No Active Schedule</h2>
                <p style={{ color: '#a1a1aa', fontSize: 15, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                    You need to build a monthly schedule during onboarding to see your timetable projections here.
                </p>
            </div>
        )
    }

    const cyclePattern = schedule.cyclePattern || []

    return (
        <div>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                        Monthly Plan
                    </h1>
                    <p style={{ color: '#a1a1aa', fontSize: 14 }}>
                        Your 7-day pattern projected forward.
                    </p>
                </div>

                {/* Month Navigator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '4px' }}>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ padding: 8, background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', borderRadius: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', minWidth: 120, textAlign: 'center' }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ padding: 8, background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', borderRadius: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* ── CALENDAR GRID ── */}
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>

                {/* Days of week header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {dates.map((date, i) => {
                        const inMonth = isSameMonth(date, currentMonth)
                        const today = isToday(date)

                        // map JS day (0=Sun, 1=Mon) to our array logic if needed. 
                        // The cyclePattern dayOfWeek matches JS Date.getDay(): 0=Sun, 1=Mon, ..., 6=Sat
                        const jsDow = date.getDay()
                        const dayConfig = cyclePattern.find((c: any) => c.dayOfWeek === jsDow)

                        return (
                            <div
                                key={date.toISOString()}
                                style={{
                                    padding: 12,
                                    height: 120,
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                    background: inMonth ? '#111113' : '#0a0a0a',
                                    position: 'relative',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: today ? '#f59e0b' : (inMonth ? '#d4d4d8' : '#52525b'),
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                    }}
                                >
                                    {format(date, 'd')}
                                </span>

                                {inMonth && dayConfig && dayConfig.types && dayConfig.types.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 24 }}>
                                        {dayConfig.types.map((type: string) => {
                                            const dayStyle = TYPE_STYLES[type] || { bg: 'transparent', border: 'transparent', text: '#52525b', icon: null as any }
                                            const Icon = dayStyle.icon
                                            return (
                                                <motion.div key={type} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        background: dayStyle.bg, border: `1px solid ${dayStyle.border}`,
                                                        borderRadius: 8, padding: '8px 10px',
                                                    }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                        {Icon && <Icon size={12} color={dayStyle.text} />}
                                                        <span style={{ fontSize: 10, fontWeight: 800, color: dayStyle.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {type}
                                                        </span>
                                                    </div>
                                                    {dayConfig.subjects && dayConfig.subjects.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                            {dayConfig.subjects.map((sub: string, idx: number) => (
                                                                <div key={idx} style={{ fontSize: 11, color: '#d4d4d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    • {sub}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                                            Free Day / General
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <style>{`
            @keyframes spin {
                100% { transform: rotate(360deg); }
            }
            `}</style>
        </div >
    )
}
