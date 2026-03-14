import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, Users, LogOut, Calendar, Settings } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useClerk } from '@clerk/react'
import { useState } from 'react'
import SettingsModal from './SettingsModal'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/syllabus', icon: BookOpen, label: 'Syllabus' },
    { to: '/mocks', icon: ClipboardCheck, label: 'Mock Tests' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/friends', icon: Users, label: 'Friends' },
]

export default function Sidebar() {
    const { user } = useAppStore()
    const { signOut } = useClerk()
    const navigate = useNavigate()
    const [showSettings, setShowSettings] = useState(false)

    return (
        <div style={{
            width: 260, height: '100%',
            background: '#0a0b0d',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(245,158,11,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <img src="/dhruva-logo.svg" alt="Dhruva" style={{ width: 22, height: 22 }} />
                </div>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.15em', color: '#fff', lineHeight: 1 }}>DHRUVA</div>
                    <div style={{ fontSize: 9, color: '#3f3f46', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Study Tracker</div>
                </div>
            </div>

            {/* Exam badge */}
            {user?.examId && (
                <div style={{ margin: '0 12px 12px', padding: '10px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(245,158,11,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Preparing for</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(user.examId as any).name}
                    </div>
                </div>
            )}

            <div style={{ height: 1, margin: '0 12px 8px', background: 'rgba(255,255,255,0.04)' }} />

            {/* Nav */}
            <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} style={{ display: 'block', textDecoration: 'none', marginBottom: 2 }}>
                        {({ isActive }) => (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 10,
                                background: isActive ? 'rgba(245,158,11,0.09)' : 'transparent',
                                border: `1px solid ${isActive ? 'rgba(245,158,11,0.15)' : 'transparent'}`,
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
                                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                                }}>
                                    <Icon size={15} color={isActive ? '#f59e0b' : '#52525b'} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#f4f4f5' : '#71717a', flex: 1 }}>{label}</span>
                                {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ height: 1, margin: '8px 12px', background: 'rgba(255,255,255,0.04)' }} />

            {/* Settings button */}
            <div style={{ padding: '4px 8px' }}>
                <button onClick={() => setShowSettings(true)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10, border: '1px solid transparent',
                        background: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
                        <Settings size={15} color="#52525b" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#71717a' }}>Settings</span>
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#52525b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 6, padding: '2px 7px', letterSpacing: '0.06em' }}>EXAM + PLAN</span>
                </button>
            </div>

            <div style={{ height: 1, margin: '4px 12px 0', background: 'rgba(255,255,255,0.04)' }} />

            {/* User */}
            {user && (
                <div style={{ padding: '12px 12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user.avatar
                            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>{user.name?.[0] || '?'}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                        <div style={{ fontSize: 10, color: '#3f3f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                    <button onClick={() => signOut(() => navigate('/'))}
                        title="Sign out"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#52525b', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
                        <LogOut size={15} />
                    </button>
                </div>
            )}

            <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    )
}
