import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import { EmptyState, Button } from '@/components/ui/Primitives'
import { Compass } from 'lucide-react'

function Routed() {
  const { state } = useApp()

  return (
    <AnimatePresence mode="wait">
      {!state.onboarded ? (
        <Onboarding key="onboarding" />
      ) : (
        <Routes key="app">
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
            <Route
              path="*"
              element={
                <EmptyState
                  icon={<Compass size={22} />}
                  title="Nothing lives here"
                  body="That page does not exist in the prototype. Discover is a better place to be."
                  action={<Button onClick={() => { window.location.href = '/discover' }}>Open Discover</Button>}
                />
              }
            />
          </Route>
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </AnimatePresence>
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
