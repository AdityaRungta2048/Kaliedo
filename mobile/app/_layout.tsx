import { useEffect } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
// Subpath imports so Metro bundles five faces, not every weight of three families.
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold'
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular'
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular'
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium'
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold'
import { AppProvider, useApp } from '@/store/AppContext'
import { ReaderProvider } from '@/store/ReaderContext'
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider'
import { ReaderLayer } from '@/components/PostReader'
import { Toaster } from '@/components/Toaster'

void SplashScreen.preventAutoHideAsync()

function Shell() {
  const { c, scheme } = useTheme()
  const { state } = useApp()
  const router = useRouter()
  const segments = useSegments()

  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Newsreader_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  const ready = fontsLoaded && state.hydrated

  useEffect(() => { if (ready) void SplashScreen.hideAsync() }, [ready])
  useEffect(() => { void SystemUI.setBackgroundColorAsync(c.canvas) }, [c.canvas])

  // Send first-time readers through onboarding before anything else.
  useEffect(() => {
    if (!ready) return
    const onOnboarding = segments[0] === 'onboarding'
    if (!state.onboarded && !onOnboarding) router.replace('/onboarding')
    else if (state.onboarded && onOnboarding) router.replace('/')
  }, [ready, state.onboarded, segments, router])

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.canvas }} />

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.canvas },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="messages/index" />
        <Stack.Screen name="messages/[id]" />
        <Stack.Screen name="u/[handle]" />
        <Stack.Screen name="topic/[name]" />
        <Stack.Screen name="settings" />
      </Stack>
      <ReaderLayer />
      <Toaster />
    </View>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemeProvider>
            <ReaderProvider>
              <Shell />
            </ReaderProvider>
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
