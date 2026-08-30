import { useLocalSearchParams } from 'expo-router'
import { ProfileScreen } from '@/screens/ProfileScreen'

export default function UserProfile() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  return <ProfileScreen handle={handle} />
}
