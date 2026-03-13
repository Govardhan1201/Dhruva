import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { groupApi } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { Users, Search, Copy, CheckCircle2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

const CARD = 'rounded-3xl p-6 bg-[#0c0e12] border border-white/[0.05]'
const INPUT_CLS = 'w-full px-4 py-3 rounded-xl text-sm bg-[#070809] border border-white/[0.07] text-zinc-100 placeholder:text-zinc-700 focus:border-amber-500/60 focus:outline-none transition-colors'
const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309', '#52525b']

export default function Friends() {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showJoin, setShowJoin] = useState(false)
    const [joinCode, setJoinCode] = useState('')
    const [copied, setCopied] = useState(false)
    const { user, schedule } = useAppStore()

    useEffect(() => {
        if (!user?.groupIds?.length) { setLoading(false); return }
        groupApi.leaderboard(user.groupIds[0])
            .then(r => setLeaderboard(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    const copyInvite = () => {
        if (!(schedule as any)?.inviteCode) return
        navigator.clipboard.writeText((schedule as any).inviteCode)
        setCopied(true)
        toast.success('Invite code copied!', { style: { background: '#18181b', color: '#f59e0b', border: '1px solid #3f3f46' } })
        setTimeout(() => setCopied(false), 2000)
    }

    const joinGroup = async () => {
        if (!joinCode) return
        try {
            await groupApi.join(joinCode)
            toast.success('Joined successfully!', { style: { background: '#18181b', color: '#10b981', border: '1px solid #3f3f46' } })
            setShowJoin(false)
            setTimeout(() => window.location.reload(), 1000)
        } catch {
            toast.error('Invalid invite code')
        }
    }

    const createGroup = async () => {
        if (!schedule) { toast.error('You need a schedule to create a group'); return }
        try {
            await groupApi.create({ name: `${user?.name?.split(' ')[0]}'s Study Group`, scheduleId: (schedule as any)._id })
            toast.success('Study group created!', { style: { background: '#18181b', color: '#10b981', border: '1px solid #3f3f46' } })
            setTimeout(() => window.location.reload(), 1000)
        } catch {
            toast.error('Failed to create group')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
    )

    const inviteCode = (schedule as any)?.inviteCode

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-24">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Friends &amp; Groups</h1>
                    <p className="text-zinc-500 mt-2">Compete and stay accountable together</p>
                </div>
                <div className="flex items-center gap-2">
                    {schedule && !user?.groupIds?.length && (
                        <button onClick={createGroup}
                            className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all bg-zinc-900 text-zinc-300 hover:text-white border border-white/[0.07] hover:border-white/[0.12]">
                            Create Group
                        </button>
                    )}
                    <button onClick={() => setShowJoin(!showJoin)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-black text-black bg-amber-500 hover:bg-amber-400 transition-colors">
                        <Search className="w-4 h-4" /> Join
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showJoin && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className={CARD}>
                        <h3 className="font-black text-white mb-4">Enter Invite Code</h3>
                        <div className="flex gap-3">
                            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="e.g. A1B2C3" className={INPUT_CLS + ' uppercase tracking-widest font-bold'} />
                            <button onClick={joinGroup}
                                className="px-6 py-3 rounded-xl font-black text-sm text-black bg-amber-500 hover:bg-amber-400 transition-colors whitespace-nowrap">
                                Join
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Leaderboard */}
                <div className={CARD + ' lg:col-span-2'}>
                    <h3 className="font-black text-white mb-6 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" /> Group Leaderboard
                    </h3>
                    {leaderboard.length === 0 ? (
                        <div className="py-16 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-800/40 flex items-center justify-center">
                                <Users size={28} className="text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-white font-bold">No group yet</p>
                                <p className="text-zinc-500 text-sm mt-1">Create or join a group to see the leaderboard</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaderboard.map((lb, i) => (
                                <div key={lb.user._id}
                                    className="flex items-center gap-4 p-4 rounded-2xl relative overflow-hidden bg-zinc-900/30 border border-white/[0.04]">
                                    {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-amber-500/8 to-transparent pointer-events-none" />}
                                    <div className="w-8 flex-shrink-0 text-center font-black text-lg"
                                        style={{ color: RANK_COLORS[Math.min(i, 3)] }}>
                                        #{i + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-white/5 flex-shrink-0">
                                        {lb.user.avatar
                                            ? <img src={lb.user.avatar} className="w-full h-full object-cover" alt="" />
                                            : <div className="w-full h-full flex items-center justify-center font-bold text-sm text-amber-400 bg-amber-500/10">
                                                {lb.user.name[0]}
                                            </div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-zinc-200 truncate">
                                            {lb.user.name} {lb.user._id === user?._id ? <span className="text-amber-500">(You)</span> : ''}
                                        </div>
                                        <div className="text-xs text-zinc-600 mt-0.5">
                                            {lb.completedTasks}/{lb.totalTasks} tasks · {Math.round((lb.totalStudyMinutes || 0) / 60)}h studied
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xl font-black text-amber-400">{lb.completionRate}%</div>
                                        <div className="text-xs text-zinc-600">Completion</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Invite Card */}
                <div className={CARD + ' h-max'}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-amber-500/10">
                        <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="font-black text-white text-lg mb-2">Invite Friends</h3>
                    <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                        Share your group code to sync schedules and compete on the leaderboard.
                    </p>
                    {inviteCode ? (
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] text-center mb-4 cursor-pointer hover:bg-black/60 transition-colors"
                            onClick={copyInvite}>
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-amber-500/70">Your Group Code</div>
                            <div className="text-2xl font-black tracking-widest text-white">{inviteCode}</div>
                        </div>
                    ) : (
                        <div className="text-xs text-center p-4 bg-white/[0.03] rounded-2xl mb-4 text-zinc-600 border border-white/[0.04]">
                            Create a schedule to get a group code
                        </div>
                    )}
                    <button onClick={copyInvite} disabled={!inviteCode}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-colors disabled:opacity-40 bg-zinc-900 border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.12]">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
            </div>
        </div>
    )
}
