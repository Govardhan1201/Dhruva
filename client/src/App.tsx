import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Syllabus from './pages/Syllabus'
import MockTests from './pages/MockTests'
import Analytics from './pages/Analytics'
import Friends from './pages/Friends'
import Onboarding from './pages/Onboarding'
import Landing from './pages/Landing'
import CalendarView from './pages/Calendar'
import { useAppStore } from './store/appStore'
import { authApi } from './lib/api'
import SmoothLoader from './components/layout/SmoothLoader'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <SmoothLoader />
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isSignedIn, isLoaded } = useAuth()
  const { setUser, user } = useAppStore()
  const [fetchingUser, setFetchingUser] = useState(false)

  useEffect(() => {
    if (isSignedIn && !user && !fetchingUser) {
      setFetchingUser(true)
      authApi.me()
        .then(r => {
          setUser(r.data)
          setFetchingUser(false)
        })
        .catch(() => {
          setFetchingUser(false)
        })
    }
  }, [isSignedIn])

  // Still loading Clerk auth state
  if (!isLoaded) return <SmoothLoader />

  // Signed in but still fetching user from DB
  if (isSignedIn && !user && fetchingUser) return <SmoothLoader />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={
        <AuthGate><Onboarding /></AuthGate>
      } />
      <Route element={<AuthGate><Layout /></AuthGate>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/mocks" element={<MockTests />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/friends" element={<Friends />} />
      </Route>
      {/* Catch-all: if signed in, route to right place */}
      <Route path="*" element={
        isSignedIn
          ? <Navigate to={user?.scheduleId ? '/dashboard' : '/onboarding'} replace />
          : <Navigate to="/" replace />
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
