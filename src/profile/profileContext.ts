import { createContext } from 'react'

export type ProfileContextValue = {
  name: string
  error: string
  saveName: (name: string) => boolean
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)
