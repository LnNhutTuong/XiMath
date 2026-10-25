export const PROFILE_KEY = 'ximath.profile.v1'
export const MAX_NAME_LENGTH = 24

export type NameValidation =
  | { value: string; error: '' }
  | { value: ''; error: string }

export type ProfileStorage = Pick<Storage, 'getItem' | 'setItem'>

export function validateDisplayName(value: string): NameValidation {
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ')
  const length = Array.from(normalized).length

  if (!normalized) return { value: '', error: 'Em hãy nhập tên trước nhé.' }
  if (length < 2) return { value: '', error: 'Tên cần có ít nhất 2 ký tự.' }
  if (length > MAX_NAME_LENGTH) {
    return { value: '', error: `Tên không được dài quá ${MAX_NAME_LENGTH} ký tự.` }
  }
  if (!/^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(normalized)) {
    return {
      value: '',
      error: 'Tên chỉ nên gồm chữ cái, dấu cách, dấu nháy hoặc gạch nối nhé.',
    }
  }

  return { value: normalized, error: '' }
}

export function readDisplayName(storage: ProfileStorage): NameValidation {
  try {
    const stored = storage.getItem(PROFILE_KEY)
    if (!stored) return { value: '', error: '' }
    const result = validateDisplayName(stored)
    if (result.error) {
      return { value: '', error: 'Tên đã lưu không hợp lệ. Em hãy nhập tên mới nhé.' }
    }
    return result
  } catch {
    return {
      value: '',
      error: 'Không thể đọc bộ nhớ trên thiết bị. Em hãy kiểm tra cài đặt trình duyệt nhé.',
    }
  }
}

export function saveDisplayName(
  storage: ProfileStorage,
  value: string,
): NameValidation {
  const result = validateDisplayName(value)
  if (result.error) return result

  try {
    storage.setItem(PROFILE_KEY, result.value)
    return result
  } catch {
    return {
      value: '',
      error: 'Chưa lưu được tên. Em hãy kiểm tra dung lượng hoặc cài đặt trình duyệt nhé.',
    }
  }
}
