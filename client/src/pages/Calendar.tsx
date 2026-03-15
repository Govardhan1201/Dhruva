import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { scheduleApi, dayplanApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isToday,
    addMonths, subMonths, isBefore, parseISO, startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

// Day type → visual style
const TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
    study:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)' },
    catchup:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)',   border: 'rgba(52,211,153,0.3)' },
    mock:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  border: 'rgba(167,139,250,0.3)' },
    revision: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',   border: 'rgba(56,189,248,0.3)' },
}

// Completion dot: red / yellow / green
const DOT_COLOR: Record<string, string> = {
    full:    '#10b981',
    partial: '#f59e0b',
    none:    '#ef4444',
}

export default function CalendarView() {
    const [schedule, setSchedule] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [rangeData, setRangeData] = useState<Record<string, { dayTypes: string[]; completionStatus: string }>>({})
    const { user } = useAppStore()

    // Parse account creation date once
    const accountStart = user?.createdAt ? startOfDay(parseISO(user.createdAt)) : null

    useEffect(() => {
        scheduleApi.me()
            .then(res => setSchedule(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    // Fetch range data whenever month changes
    useEffect(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd   = endOfMonth(currentMonth)
        const start = format(startOfWeek(monthStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        const end   = format(endOfWeek(monthEnd, { weekStartsOn: 1 }),     'yyyy-MM-dd')
        dayplanApi.range(start, end)
            .then(res => {
                const map: Record<string, any> = {}
                ;(res.data as any[]).forEach(d => { map[d.date] = d })
                setRangeData(map)
            })
            .catch(() => { })
    }, [currentMonth])

    const monthStart = startOfMonth(currentMonth)
    const monthEnd   = endOfMonth(monthStart)
    const startDate  = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate    = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const dates      = eachDayOfInterval({ start: startDate, end: endDate })
    const todayStart = startOfDay(new Date())

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
                    Complete onboarding to see your timetable projections here.
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
                    <p style={{ color: '#a1a1aa', fontSize: 14, margin: 0 }}>Your weekly pattern projected forward</p>
                </div>

                {/* Month navigator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '4px' }}>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ padding: 8, background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', borderRadius: 8 }}>
                        <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', minWidth: 120, textAlign: 'center' }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ padding: 8, background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', borderRadius: 8 }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                {Object.entries(TYPE_STYLES).map(([type, s]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: s.bg, border: `1px solid ${s.border}` }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'capitalize' }}>{type}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                    {[['#10b981', 'Full completion'], ['#f59e0b', 'Partial'], ['#ef4444', 'Incomplete']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                            <span style={{ fontSize: 10, color: '#52525b' }}>{l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CALENDAR GRID ── */}
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar body */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {dates.map((date, i) => {
                        const inMonth = isSameMonth(date, currentMonth)
                        const todayFlag = isToday(date)
                        const dateKey = format(date, 'yyyy-MM-dd')
                        const dayStart = startOfDay(date)

                        // Is this day before the user's account creation date?
                        const isBeforeAccount = accountStart ? isBefore(dayStart, accountStart) : false
                        // Is this a future day (no completion dot)?
                        const isFuture = !isBefore(dayStart, todayStart)

                        // Day type info from range API (which correctly resolves patternHistory)
                        const rangeDay = rangeData[dateKey]
                        const dayTypes = rangeDay?.dayTypes || []

                        const completionStatus = rangeDay?.completionStatus

                        return (
                            <div
                                key={date.toISOString()}
                                style={{
                                    padding: 10,
                                    minHeight: 110,
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                    background: isBeforeAccount
                                        ? '#0c0c0d'
                                        : todayFlag
                                            ? 'rgba(245,158,11,0.04)'
                                            : inMonth ? '#111113' : '#0a0a0a',
                                    position: 'relative',
                                    opacity: isBeforeAccount ? 0.4 : 1,
                                }}
                            >
                                {/* Date number + completion dot row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{
                                        fontSize: 12, fontWeight: 700,
                                        color: todayFlag ? '#f59e0b' : (inMonth ? '#d4d4d8' : '#52525b'),
                                        background: todayFlag ? 'rgba(245,158,11,0.12)' : 'transparent',
                                        borderRadius: todayFlag ? '50%' : 0,
                                        width: todayFlag ? 24 : 'auto',
                                        height: todayFlag ? 24 : 'auto',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {format(date, 'd')}
                                    </span>
                                    {/* Completion dot — only for past days AFTER account creation */}
                                    {inMonth && !isBeforeAccount && !isFuture && completionStatus && completionStatus !== 'future' && (
                                        <div
                                            title={completionStatus === 'full' ? 'All tasks completed' : completionStatus === 'partial' ? 'Partially completed' : 'No tasks completed'}
                                            style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: DOT_COLOR[completionStatus] || '#52525b',
                                                boxShadow: `0 0 5px ${DOT_COLOR[completionStatus] || '#52525b'}60`,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Account start marker */}
                                {accountStart && format(dayStart, 'yyyy-MM-dd') === format(accountStart, 'yyyy-MM-dd') && (
                                    <div style={{ fontSize: 8, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, opacity: 0.8 }}>
                                        ▶ START
                                    </div>
                                )}

                                {/* Day type tags — only if in month and NOT before account start */}
                                {inMonth && !isBeforeAccount && dayTypes.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {dayTypes.map((type: string) => {
                                            const s = TYPE_STYLES[type]
                                            if (!s) return null
                                            return (
                                                <motion.div key={type}
                                                    initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        background: s.bg, border: `1px solid ${s.border}`,
                                                        borderRadius: 6, padding: '3px 7px',
                                                        fontSize: 9, fontWeight: 800, color: s.color,
                                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                                        display: 'inline-block',
                                                    }}>
                                                    {type}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Before account — show dim dash */}
                                {inMonth && isBeforeAccount && (
                                    <div style={{ fontSize: 10, color: '#3f3f46', marginTop: 4 }}>—</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
