import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import MobileBottomNav from './MobileBottomNav'
import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { authApi, scheduleApi } from '../../lib/api'
import { useAuth } from '@clerk/react'

const SIDEBAR_W = 260

export default function Layout() {
    const { setUser, setSchedule } = useAppStore()
    const { isSignedIn } = useAuth()

    useEffect(() => {
        if (!isSignedIn) return
        authApi.me().then(r => { setUser(r.data) }).catch(() => { })
        scheduleApi.me().then(r => { setSchedule(r.data) }).catch(() => { })
    }, [isSignedIn])

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#070809' }}>

            {/* ── Desktop Sidebar (fixed, exact 260px) ── */}
            <aside style={{
                width: SIDEBAR_W,
                flexShrink: 0,
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 40,
                display: 'none',
            }} className="lg-sidebar">
                <Sidebar />
            </aside>

            {/* ── Main content column offset by sidebar ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
                className="main-col">
                <TopNav />
                <main style={{ flex: 1 }}>
                    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 32px 80px' }}>
                        <Outlet />
                    </div>
                </main>
                {/* Mobile bottom nav */}
                <div className="lg:hidden">
                    <MobileBottomNav />
                </div>
            </div>

            {/* CSS to apply sidebar visibility + margin without Tailwind custom values */}
            <style>{`
                @media (min-width: 1024px) {
                    .lg-sidebar { display: block !important; }
                    .main-col   { margin-left: ${SIDEBAR_W}px !important; }
                }
            `}</style>
        </div>
    )
}
