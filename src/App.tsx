import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { AppProvider, useApp } from '@/store/AppContext'
import { ViewerProvider } from '@/store/ViewerContext'
import { AppShell } from '@/components/layout/AppShell'
import { Onboarding } from '@/screens/Onboarding'
import { Home } from '@/screens/Home'
import { Discover } from '@/screens/Discover'
import { Create } from '@/screens/Create'
import { Activity } from '@/screens/Activity'
import { Messages } from '@/screens/Messages'
import { Profile, TopicPage } from '@/screens/Profile'
import { Settings } from '@/screens/Settings'
import { Button, EmptyState } from '@/components/ui/Primitives'

function NotFound() {
  const navigate = useNavigate()
  return (
    <EmptyState
      icon={<Compass size={22} />}
      title="Nothing lives here"
      body="That page does not exist in the prototype. Discover is a better place to be."
      action={<Button onClick={() => navigate('/discover')}>Open Discover</Button>}
    />
  )
}

function Routed() {
  const { state } = useApp()

  // Onboarding and the app are a hard swap, not a crossfade; Onboarding plays its
  // own entrance. Wrapping <Routes> in AnimatePresence tracked nothing useful.
  if (!state.onboarded) return <Onboarding />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/create" element={<Create />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile self />} />
        <Route path="/u/:handle" element={<Profile />} />
        <Route path="/topic/:topic" element={<TopicPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ViewerProvider>
          <Routed />
        </ViewerProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
