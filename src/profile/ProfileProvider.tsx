import { useState, type ReactNode } from 'react'
import { ProfileContext } from './profileContext'
import {
  readDisplayName,
  saveDisplayName,
} from './profileStore'

type StoredProfile = {
  name: string
  error: string
}

function readProfile(): StoredProfile {
  if (typeof window === 'undefined') return { name: '', error: '' }
  try {
    const result = readDisplayName(window.localStorage)
    return { name: result.value, error: result.error }
  } catch {
    return {
      name: '',
      error: 'Không thể đọc bộ nhớ trên thiết bị. Em hãy kiểm tra cài đặt trình duyệt nhé.',
    }
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(readProfile)

  function saveName(value: string): boolean {
    let result: ReturnType<typeof saveDisplayName>
    try {
      result = saveDisplayName(window.localStorage, value)
    } catch {
      result = {
        value: '',
        error: 'Chưa lưu được tên. Em hãy kiểm tra cài đặt bộ nhớ trình duyệt nhé.',
      }
    }
    if (result.error) {
      setProfile((current) => ({ ...current, error: result.error }))
      return false
    }

    setProfile({ name: result.value, error: '' })
    return true
  }

  return (
    <ProfileContext.Provider value={{ ...profile, saveName }}>
      {children}
    </ProfileContext.Provider>
  )
}
