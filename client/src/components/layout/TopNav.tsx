import { useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/react'
import { Bell } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const routeMeta: Record<string, { title: string; sub: string }> = {
    '/dashboard': { title: 'Dashboard', sub: 'Your tasks for today' },
    '/syllabus': { title: 'Syllabus', sub: 'Track your chapter progress' },
    '/mocks': { title: 'Mock Tests', sub: 'Record & review your scores' },
    '/analytics': { title: 'Analytics', sub: 'Study patterns & performance' },
    '/friends': { title: 'Friends', sub: 'Study groups & leaderboard' },
}

export default function TopNav() {
    const { pathname } = useLocation()
    const { user } = useAppStore()
    const meta = routeMeta[pathname] || { title: 'Dhruva', sub: '' }
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(7,8,9,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '0 32px',
            height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            {/* Left: page title */}
            <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f4f4f5', lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {meta.title}
                </div>
                {meta.sub && (
                    <div style={{ fontSize: 11, color: '#52525b', marginTop: 2, fontWeight: 500 }}>{meta.sub}</div>
                )}
            </div>

            {/* Right: date + bell + avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {user && (
                    <span style={{
                        fontSize: 11, fontWeight: 600, color: '#52525b',
                        background: '#111113', border: '1px solid #1c1c1f',
                        padding: '5px 12px', borderRadius: 20,
                    }}>{today}</span>
                )}
                <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 6, borderRadius: 8, color: '#52525b', position: 'relative',
                }}>
                    <Bell size={16} />
                    <span style={{
                        position: 'absolute', top: 5, right: 5,
                        width: 6, height: 6, borderRadius: '50%', background: '#f59e0b',
                    }} />
                </button>
                <UserButton appearance={{
                    elements: {
                        avatarBox: 'w-7 h-7 rounded-lg ring-1 ring-amber-500/20',
                    }
                }} />
            </div>
        </header>
    )
}
