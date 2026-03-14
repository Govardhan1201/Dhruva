import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
    id: number
    x: number
    y: number
    rotateX: number
    rotateY: number
    rotateZ: number
    scale: number
    color: string
    shape: 'star' | 'ring' | 'square' | 'dot'
}

interface Props {
    status: 'partial' | 'completed'
    onDone?: () => void
}

const PARTIAL_COLORS = ['#f59e0b', '#fbbf24', '#fde68a', '#d97706']
const COMPLETED_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#f59e0b']

function StarShape({ color }: { color: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
    )
}

export default function TaskCompletionEffect({ status, onDone }: Props) {
    const [particles, setParticles] = useState<Particle[]>([])
    const [visible, setVisible] = useState(true)
    const colors = status === 'partial' ? PARTIAL_COLORS : COMPLETED_COLORS
    const shapes: Particle['shape'][] = ['star', 'ring', 'square', 'dot', 'star']

    useEffect(() => {
        const count = status === 'completed' ? 18 : 12
        const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 280,
            y: (Math.random() - 0.5) * 200 - 40,
            rotateX: Math.random() * 720 - 360,
            rotateY: Math.random() * 720 - 360,
            rotateZ: Math.random() * 540,
            scale: 0.6 + Math.random() * 0.9,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
        }))
        setParticles(newParticles)

        const timer = setTimeout(() => {
            setVisible(false)
            onDone?.()
        }, 1400)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {visible && (
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50, overflow: 'hidden', perspective: 600,
                }}>
                    {/* Central flash ring */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0.9 }}
                        animate={{ scale: 3.5, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            width: 40, height: 40,
                            borderRadius: '50%',
                            border: `3px solid ${status === 'completed' ? '#10b981' : '#f59e0b'}`,
                        }}
                    />
                    {/* 3D Particles */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{
                                x: 0, y: 0,
                                scale: 0,
                                rotateX: 0, rotateY: 0, rotateZ: 0,
                                opacity: 1,
                            }}
                            animate={{
                                x: p.x, y: p.y,
                                scale: p.scale,
                                rotateX: p.rotateX,
                                rotateY: p.rotateY,
                                rotateZ: p.rotateZ,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 1.0 + Math.random() * 0.4,
                                ease: [0.2, 0.8, 0.4, 1],
                            }}
                            style={{
                                position: 'absolute',
                                transformStyle: 'preserve-3d',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {p.shape === 'star' && <StarShape color={p.color} />}
                            {p.shape === 'ring' && (
                                <div style={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    border: `2.5px solid ${p.color}`,
                                }} />
                            )}
                            {p.shape === 'square' && (
                                <div style={{
                                    width: 8, height: 8,
                                    background: p.color,
                                    borderRadius: 2,
                                    transform: `rotate(${Math.random() * 45}deg)`,
                                }} />
                            )}
                            {p.shape === 'dot' && (
                                <div style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: p.color,
                                }} />
                            )}
                        </motion.div>
                    ))}
                    {/* Status label pop */}
                    <motion.div
                        initial={{ y: 0, opacity: 1, scale: 0.8 }}
                        animate={{ y: -44, opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            background: status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            border: `1px solid ${status === 'completed' ? '#10b981' : '#f59e0b'}`,
                            borderRadius: 20, padding: '4px 12px',
                            fontSize: 11, fontWeight: 800,
                            color: status === 'completed' ? '#34d399' : '#fbbf24',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {status === 'completed' ? '✓ COMPLETE!' : '◑ PARTIAL'}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
