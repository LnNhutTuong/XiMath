import { describe, expect, it } from 'vitest'
import {
  calculateStreak,
  clearLearningHistory,
  createDefaultLearningState,
  loadLearningState,
  saveLearningState,
  type PracticeAttempt,
  type StorageLike,
} from './learningStore'
import type { Question } from '../features/question-generator/types'
import { createDailyPracticeRecord, DEFAULT_DAILY_CONFIG } from './dailyPractice'

function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

function attempt(studyDate: string): PracticeAttempt {
  const question: Question = {
    id: `q-${studyDate}`,
    operandA: 1,
    operandB: 1,
    operator: '+',
    answer: 2,
    difficulty: 'warmup',
  }
  return {
    id: studyDate,
    category: 'addition',
    completedAt: `${studyDate}T12:00:00.000Z`,
    studyDate,
    questionCount: 1,
    correctCount: 1,
    answers: [{ question, answer: 2 }],
  }
}

describe('learning state storage', () => {
  it('restores saved settings, progress, and learned tables', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    state.settings.questionCount = 20
    state.attempts = [attempt('2026-10-25')]
    state.learnedTables = [2, 10]
    expect(saveLearningState(storage, state)).toBe('')
    expect(loadLearningState(storage)).toEqual({ state, error: '' })
  })

  it('restores preferred daily practice settings independently of the current date', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    state.dailyConfig = {
      operators: ['÷', '+'],
      questionCounts: { warmup: 8, practice: 12, challenge: 10 },
    }
    expect(saveLearningState(storage, state)).toBe('')
    expect(loadLearningState(storage).state.dailyConfig).toEqual(state.dailyConfig)
  })

  it('restores a daily question set and its unfinished progress after reload', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    const record = createDailyPracticeRecord('2026-10-25', DEFAULT_DAILY_CONFIG)
    record.currentIndex = 7
    record.answers[0] = {
      question: record.questions[0],
      answer: record.questions[0].answer,
    }
    state.dailySessions = [record]

    expect(saveLearningState(storage, state)).toBe('')
    const restored = loadLearningState(storage)
    expect(restored.error).toBe('')
    expect(restored.state.dailySessions).toEqual([record])
  })

  it('restores daily sessions containing exact division questions', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    const record = createDailyPracticeRecord('2026-10-25', {
      operators: ['÷'],
      questionCounts: { warmup: 10, practice: 10, challenge: 10 },
    })
    state.dailySessions = [record]

    expect(saveLearningState(storage, state)).toBe('')
    expect(loadLearningState(storage).state.dailySessions).toEqual([record])
  })

  it('migrates saved version-one learning data without daily-session records', () => {
    const storage = createMemoryStorage()
    const oldState = createDefaultLearningState()
    const { dailySessions: _dailySessions, ...legacyState } = oldState
    storage.setItem('ximath.learning.v1', JSON.stringify(legacyState))

    const loaded = loadLearningState(storage)
    expect(loaded.error).toBe('')
    expect(loaded.state.dailySessions).toEqual([])
    expect(loaded.state.dailyConfig).toEqual(oldState.dailyConfig)
    expect(loaded.state.settings).toEqual(oldState.settings)
  })

  it('uses defaults and reports corrupt saved JSON', () => {
    const storage = createMemoryStorage()
    storage.setItem('ximath.learning.v1', '{not json')
    expect(loadLearningState(storage)).toEqual({
      state: createDefaultLearningState(),
      error: 'Dữ liệu học tập bị lỗi. Em có thể bắt đầu lại với cấu hình mặc định.',
    })
  })

  it('rejects settings and attempts whose stored values are out of range or inconsistent', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    state.settings.maxResult = 1_000_000
    storage.setItem('ximath.learning.v1', JSON.stringify(state))
    expect(loadLearningState(storage).error).toContain('không tương thích')

    const invalidState = createDefaultLearningState()
    const invalidAttempt = attempt('2026-10-25')
    invalidAttempt.correctCount = 0
    invalidState.attempts = [invalidAttempt]
    storage.setItem('ximath.learning.v1', JSON.stringify(invalidState))
    expect(loadLearningState(storage).error).toContain('không tương thích')
  })

  it('does not persist invalid in-memory settings or learned-table values', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    state.settings.questionCount = 101
    expect(saveLearningState(storage, state)).toContain('chưa hợp lệ')
    expect(storage.getItem('ximath.learning.v1')).toBeNull()

    state.settings.questionCount = 10
    state.learnedTables = [1]
    expect(saveLearningState(storage, state)).toContain('chưa hợp lệ')
    expect(storage.getItem('ximath.learning.v1')).toBeNull()
  })

  it('clears study history and learned tables while preserving preferences', () => {
    const storage = createMemoryStorage()
    const state = createDefaultLearningState()
    state.settings.questionCount = 15
    state.attempts = [attempt('2026-10-25')]
    state.learnedTables = [2, 3]
    const result = clearLearningHistory(storage, state)

    expect(result.error).toBe('')
    expect(result.state.settings.questionCount).toBe(15)
    expect(result.state.attempts).toEqual([])
    expect(result.state.learnedTables).toEqual([])
    expect(loadLearningState(storage).state).toEqual(result.state)
  })

  it('calculates consecutive study days in Vietnam calendar dates', () => {
    expect(
      calculateStreak(
        [attempt('2026-10-25'), attempt('2026-10-24'), attempt('2026-10-23')],
        '2026-10-25',
      ),
    ).toBe(3)
    expect(calculateStreak([attempt('2026-10-24')], '2026-10-25')).toBe(1)
    expect(calculateStreak([attempt('2026-10-23')], '2026-10-25')).toBe(0)
  })
})
