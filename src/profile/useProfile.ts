import { useContext } from 'react'
import { ProfileContext } from './profileContext'

export function useProfile() {
  const profile = useContext(ProfileContext)
  if (!profile) throw new Error('useProfile phải được dùng bên trong ProfileProvider.')
  return profile
}
