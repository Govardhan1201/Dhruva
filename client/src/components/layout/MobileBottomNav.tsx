import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, Users, Calendar } from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/syllabus', icon: BookOpen, label: 'Syllabus' },
    { to: '/mocks', icon: ClipboardCheck, label: 'Mocks' },
    { to: '/analytics', icon: BarChart3, label: 'Stats' },
    { to: '/calendar', icon: Calendar, label: 'Dates' },
    { to: '/friends', icon: Users, label: 'Social' },
]

export default function MobileBottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.05] z-50 px-2 pb-safe">
            <div className="flex justify-around">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `flex flex-col items-center py-3 px-3 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${isActive ? 'text-amber-400' : 'text-zinc-700'}`}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1.5 rounded-xl mb-1 transition-all ${isActive ? 'bg-amber-500/12' : ''}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-zinc-600'}`} />
                                </div>
                                <span>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
