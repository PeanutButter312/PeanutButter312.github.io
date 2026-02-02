import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

// Pages
import LandingPage from '@/pages/LandingPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import WritingStudioPage from '@/pages/WritingStudioPage'
import MemoryPage from '@/pages/MemoryPage'
import SettingsPage from '@/pages/SettingsPage'
import ConversationReplyPage from '@/pages/ConversationReplyPage'

function App() {
  const { isOnboarded } = useAuthStore()

  useEffect(() => {
    // Dark mode by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/onboarding" 
          element={isOnboarded ? <Navigate to="/dashboard" /> : <OnboardingPage />} 
        />
        <Route 
          path="/dashboard" 
          element={!isOnboarded ? <Navigate to="/onboarding" /> : <DashboardPage />} 
        />
        <Route 
          path="/write" 
          element={!isOnboarded ? <Navigate to="/onboarding" /> : <WritingStudioPage />} 
        />
        <Route 
          path="/memory" 
          element={!isOnboarded ? <Navigate to="/onboarding" /> : <MemoryPage />} 
        />
        <Route
          path="/settings"
          element={!isOnboarded ? <Navigate to="/onboarding" /> : <SettingsPage />}
        />
        <Route
          path="/conversation-reply"
          element={!isOnboarded ? <Navigate to="/onboarding" /> : <ConversationReplyPage />}
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
