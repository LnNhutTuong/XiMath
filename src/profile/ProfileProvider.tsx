import { useState, type ReactNode } from 'react'
import { ProfileContext } from './profileContext'

const PROFILE_KEY = 'ximath.profile.v1'
const MAX_NAME_LENGTH = 24

type StoredProfile = {
  name: string
  error: string
}

function readProfile(): StoredProfile {
  if (typeof window === 'undefined') return { name: '', error: '' }

  try {
    const name = window.localStorage.getItem(PROFILE_KEY)?.trim().slice(0, MAX_NAME_LENGTH)
    return { name: name ?? '', error: '' }
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
    const name = value.trim().slice(0, MAX_NAME_LENGTH)
    if (!name) {
      setProfile((current) => ({ ...current, error: 'Em hãy nhập tên trước nhé.' }))
      return false
    }

    try {
      window.localStorage.setItem(PROFILE_KEY, name)
    } catch {
      setProfile((current) => ({
        ...current,
        error: 'Chưa lưu được tên. Em hãy kiểm tra dung lượng hoặc cài đặt trình duyệt nhé.',
      }))
      return false
    }

    setProfile({ name, error: '' })
    return true
  }

  return (
    <ProfileContext.Provider value={{ ...profile, saveName }}>
      {children}
    </ProfileContext.Provider>
  )
}
