import { useNavigate } from 'react-router-dom'
import { SignInButton, SignUpButton, useAuth } from '@clerk/react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { BookOpen, BarChart3, Users, ChevronRight, ArrowRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const examBadges = ['CA Foundation', 'CA Inter', 'CA Final', 'JEE Mains', 'JEE Advanced', 'NEET UG', 'NEET PG', 'UPSC Prelims', 'UPSC Mains']

const features = [
  { icon: Zap, title: 'Smart Scheduling', desc: 'A 7-day repeating cycle with auto-catchup days for missed tasks.', bg: '#1c1a14', border: '#3d3010', iconColor: '#f59e0b' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Heatmaps, score trends, and automatic weak chapter detection.', bg: '#121a24', border: '#1e3a5f', iconColor: '#60a5fa' },
  { icon: Users, title: 'Study Groups', desc: 'Invite friends, compete on leaderboards, compare daily scores.', bg: '#12211a', border: '#1a4a2e', iconColor: '#34d399' },
  { icon: BookOpen, title: 'PYQ Mock Tests', desc: 'MCQ mocks from the built-in PYQ bank with score tracking.', bg: '#1c1228', border: '#3b1f5e', iconColor: '#a78bfa' },
]

function TiltCard({ feature }: { feature: typeof features[0] }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17deg", "-17deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17deg", "17deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY, rotateX, transformStyle: "preserve-3d",
        borderRadius: 20, padding: 28,
        background: feature.bg, border: `1px solid ${feature.border}`,
        cursor: 'default',
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{
        transform: "translateZ(50px)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, marginBottom: 20,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <feature.icon size={22} color={feature.iconColor} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f4f4f5', marginBottom: 10 }}>{feature.title}</div>
        <div style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6 }}>{feature.desc}</div>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  const { isSignedIn } = useAuth()
  const { user } = useAppStore()
  const nav = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll Parallax Hooks
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const opacityY = useTransform(scrollY, [0, 400], [1, 0])

  // Once signed in AND user is loaded, redirect to the right place
  useEffect(() => {
    if (isSignedIn && user !== undefined) {
      nav(user?.examId ? '/dashboard' : '/onboarding', { replace: true })
    }
  }, [isSignedIn, user])

  return (
    <div ref={containerRef} style={{ background: '#080a0d', color: '#f4f4f5', fontFamily: 'Inter, sans-serif', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ── PARALLAX BACKGROUND GRID ── */}
      <motion.div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '100vh',
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          y: heroY,
          opacity: opacityY,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(8,10,13,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/dhruva-logo.svg" alt="Dhruva" style={{ width: 36, height: 36 }} />
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.05em', color: '#fef3c7' }}>DHRUVA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <SignInButton mode="modal">
              <button style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{
                background: '#f59e0b', color: '#000', border: 'none', borderRadius: 10,
                padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s'
              }}>
                Get Started <ChevronRight size={14} />
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 160, paddingBottom: 100, textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 40, padding: '6px 16px', marginBottom: 40,
            color: '#f59e0b', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            <Zap size={12} />
            Track. Prepare. Excel — India's Study Platform
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05, margin: '0 0 28px 0', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#ffffff', display: 'block' }}>Study Smarter.</span>
            <span style={{ color: '#f59e0b', display: 'block' }}>Win Together.</span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: 20, color: '#71717a', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px' }}>
            Your accountability partner for CA, JEE, NEET & UPSC prep. Track tasks,
            master your syllabus, take PYQ mocks, and compete with your study group.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 64 }}>
            <SignUpButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000', border: 'none', borderRadius: 12,
                  padding: '16px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 20px -6px rgba(245,158,11,0.5)'
                }}
              >
                Start for Free <ArrowRight size={18} />
              </motion.button>
            </SignUpButton>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'transparent', color: '#a1a1aa',
                  border: '1px solid #27272a', borderRadius: 12,
                  padding: '16px 32px', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Sign In
              </motion.button>
            </SignInButton>
          </div>

          {/* Exam badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {examBadges.map(b => (
              <span key={b} style={{
                padding: '7px 16px', borderRadius: 40, fontSize: 13, fontWeight: 500,
                border: '1px solid #27272a', background: '#111113', color: '#71717a',
              }}>{b}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { val: '9+', label: 'Exam Presets', Icon: BookOpen },
            { val: '100%', label: 'Free Core Features', Icon: CheckCircle2 },
            { val: '∞', label: 'Study Streaks', Icon: TrendingUp },
          ].map(({ val, label, Icon }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Icon size={20} color="#f59e0b" />
              <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 14, color: '#52525b', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>What you get</p>
            <h2 style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Everything you need to reach the top
            </h2>
            <p style={{ fontSize: 18, color: '#71717a', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Built specifically for Indian competitive exam aspirants.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, perspective: 1000 }}>
            {features.map((f) => (
              <TiltCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DHRUVA ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '100px 32px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Why Dhruva?</p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              Your north star for competitive exam success
            </h2>
            <p style={{ fontSize: 17, color: '#71717a', lineHeight: 1.75, marginBottom: 36 }}>
              Dhruva — the north star — never moves. It guides millions of navigators every night.
              We built this platform to be that fixed, reliable guide for every CA, JEE, NEET and UPSC aspirant.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Free for all core features', 'No ads, no distractions', '9 exam presets ready to go', 'Works on mobile & desktop'].map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle2 size={18} color="#f59e0b" />
                  <span style={{ fontSize: 15, color: '#d4d4d8', fontWeight: 500 }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', width: 260, height: 260, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
              }} />
              <img src="/dhruva-logo.svg" alt="Dhruva star" style={{ width: 200, height: 200, position: 'relative', zIndex: 1 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 700, margin: '0 auto' }}
        >
          <img src="/dhruva-logo.svg" alt="Dhruva" style={{ width: 64, height: 64, margin: '0 auto 32px' }} />
          <h2 style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.1 }}>
            Ready to transform your prep?
          </h2>
          <p style={{ fontSize: 19, color: '#71717a', margin: '0 0 48px', lineHeight: 1.6 }}>
            Join thousands of serious aspirants already using Dhruva to plan, track, and ace their exams.
          </p>
          <SignUpButton mode="modal">
            <button style={{
              background: '#f59e0b', color: '#000', border: 'none', borderRadius: 14,
              padding: '18px 44px', fontSize: 17, fontWeight: 800, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
              Create Free Account <ArrowRight size={18} />
            </button>
          </SignUpButton>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/dhruva-logo.svg" alt="Dhruva" style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fef3c7', letterSpacing: '0.05em' }}>DHRUVA</span>
          </div>
          <p style={{ fontSize: 13, color: '#3f3f46' }}>
            © {new Date().getFullYear()} Dhruva Preparation Platform. Built for India's top aspirants.
          </p>
        </div>
      </footer>
    </div>
  )
}
