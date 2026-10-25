import { describe, expect, it } from 'vitest'
import {
  PROFILE_KEY,
  readDisplayName,
  saveDisplayName,
  validateDisplayName,
  type ProfileStorage,
} from './profileStore'

function memoryStorage(): ProfileStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}

describe('display name validation', () => {
  it('accepts Vietnamese names and normalizes spacing and Unicode', () => {
    expect(validateDisplayName('  Nguye\u0302\u0303n   Minh Anh  ')).toEqual({
      value: 'Nguyễn Minh Anh',
      error: '',
    })
    expect(validateDisplayName("An-Nhi's")).toEqual({ value: "An-Nhi's", error: '' })
  })

  it('rejects empty, too short, too long, and non-name characters', () => {
    expect(validateDisplayName('   ').error).toContain('nhập tên')
    expect(validateDisplayName('A').error).toContain('ít nhất 2')
    expect(validateDisplayName('A'.repeat(25)).error).toContain('24')
    expect(validateDisplayName('Minh 123').error).toContain('chữ cái')
    expect(validateDisplayName('<script>').error).toContain('chữ cái')
  })

  it('persists only validated names and reads them back', () => {
    const storage = memoryStorage()
    expect(saveDisplayName(storage, '  Minh Anh  ')).toEqual({
      value: 'Minh Anh',
      error: '',
    })
    expect(storage.getItem(PROFILE_KEY)).toBe('Minh Anh')
    expect(readDisplayName(storage)).toEqual({ value: 'Minh Anh', error: '' })
    expect(saveDisplayName(storage, 'Bé 1').error).not.toBe('')
    expect(storage.getItem(PROFILE_KEY)).toBe('Minh Anh')
  })

  it('reports invalid legacy names instead of silently displaying them', () => {
    const storage = memoryStorage()
    storage.setItem(PROFILE_KEY, 'Minh 123')
    expect(readDisplayName(storage)).toEqual({
      value: '',
      error: 'Tên đã lưu không hợp lệ. Em hãy nhập tên mới nhé.',
    })
  })
})
