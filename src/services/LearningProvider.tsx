import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { Question } from '../features/question-generator/types'
import { LearningContext } from './learningContext'
import {
  calculateStreak,
  clearLearningHistory,
  loadLearningState,
  readStudyDate,
  saveLearningState,
  type LearningSettings,
  type LearningState,
  type PracticeAttempt,
  type StorageLike,
  type DailyPracticeRecord,
  type DailyPracticeConfig,
} from './learningStore'
import { getDailyStudyDate, updateDailyRecord } from './dailyPractice'

function getStorage(): StorageLike {
  try {
    return window.localStorage
  } catch {
    return {
      getItem() {
        throw new Error('Local storage is not available.')
      },
      setItem() {
        throw new Error('Local storage is not available.')
      },
      removeItem() {
        throw new Error('Local storage is not available.')
      },
    }
  }
}

function createAttempt(
  category: PracticeAttempt['category'],
  questions: Question[],
  answers: Record<string, number>,
  completedAt = new Date(),
): PracticeAttempt {
  return {
    id: `${completedAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    completedAt: completedAt.toISOString(),
    studyDate: readStudyDate(completedAt),
    questionCount: questions.length,
    correctCount: questions.reduce(
      (count, question) => count + (answers[question.id] === question.answer ? 1 : 0),
      0,
    ),
    answers: questions.map((question) => ({
      question,
      answer: answers[question.id] ?? null,
    })),
  }
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadLearningState(getStorage()))
  const [state, setState] = useState(initial.state)
  const [error, setError] = useState(initial.error)

  const persist = useCallback((nextState: LearningState) => {
    const saveError = saveLearningState(getStorage(), nextState)
    if (saveError) {
      setError(saveError)
      toast.error(saveError)
      return false
    }
    setState(nextState)
    setError('')
    return true
  }, [])

  const saveSettings = useCallback(
    (settings: LearningSettings) => persist({ ...state, settings }),
    [persist, state],
  )

  const saveDailyConfig = useCallback(
    (dailyConfig: DailyPracticeConfig) =>
      persist({
        ...state,
        dailyConfig: {
          operators: [...dailyConfig.operators],
          questionCounts: { ...dailyConfig.questionCounts },
        },
      }),
    [persist, state],
  )

  const recordAttempt = useCallback(
    (
      category: PracticeAttempt['category'],
      questions: Question[],
      answers: Record<string, number>,
    ) => {
      const attempt = createAttempt(category, questions, answers)
      return persist({ ...state, attempts: [attempt, ...state.attempts] })
    },
    [persist, state],
  )

  const toggleLearnedTable = useCallback(
    (table: number) => {
      const learnedTables = state.learnedTables.includes(table)
        ? state.learnedTables.filter((value) => value !== table)
        : [...state.learnedTables, table].sort((a, b) => a - b)
      return persist({ ...state, learnedTables })
    },
    [persist, state],
  )

  const clearHistory = useCallback(() => {
    const result = clearLearningHistory(getStorage(), state)
    setState(result.state)
    if (result.error) {
      setError(result.error)
      toast.error(result.error)
      return false
    }
    setError('')
    toast.success('Lịch sử học tập đã được xóa.')
    return true
  }, [state])

  const ensureDailyPractice = useCallback(
    (record: DailyPracticeRecord) => {
      if (state.dailySessions.some((session) => session.studyDate === record.studyDate)) {
        return true
      }
      return persist({
        ...state,
        dailySessions: [record, ...state.dailySessions].slice(0, 30),
      })
    },
    [persist, state],
  )

  const replaceDailyPractice = useCallback(
    (record: DailyPracticeRecord) => {
      const existing = state.dailySessions.find(
        (session) => session.studyDate === record.studyDate,
      )
      if (
        existing &&
        (existing.completedAt !== null ||
          existing.currentIndex > 0 ||
          existing.answers.some((entry) => entry.answer !== null))
      ) {
        toast.error('Bài hôm nay đã có tiến độ. Em hãy hoàn thành bài hiện tại trước nhé.')
        return false
      }
      const dailySessions = state.dailySessions.filter(
        (session) => session.studyDate !== record.studyDate,
      )
      return persist({
        ...state,
        dailyConfig: {
          operators: [...record.config.operators],
          questionCounts: { ...record.config.questionCounts },
        },
        dailySessions: [record, ...dailySessions].slice(0, 30),
      })
    },
    [persist, state],
  )

  const saveDailyProgress = useCallback(
    (studyDate: string, currentIndex: number, answers: Record<string, number>) => {
      const existing = state.dailySessions.find((session) => session.studyDate === studyDate)
      if (!existing || existing.completedAt) return false
      const updated = updateDailyRecord(existing, currentIndex, answers)
      return persist({
        ...state,
        dailySessions: state.dailySessions.map((session) =>
          session.studyDate === studyDate ? updated : session,
        ),
      })
    },
    [persist, state],
  )

  const completeDailyPractice = useCallback(
    (studyDate: string, answers: Record<string, number>) => {
      const existing = state.dailySessions.find((session) => session.studyDate === studyDate)
      if (!existing) {
        toast.error('Không tìm thấy bài tập hôm nay. Em hãy tải lại trang nhé.')
        return false
      }
      if (existing.completedAt) return true
      if (getDailyStudyDate() !== studyDate) {
        toast.error('Ngày học vừa thay đổi. Bài này chưa được ghi vào kết quả chính thức.')
        return false
      }
      const completionDate = new Date()
      if (readStudyDate(completionDate) !== studyDate) {
        toast.error('Ngày học vừa thay đổi. Bài này chưa được ghi vào kết quả chính thức.')
        return false
      }
      const completedAt = completionDate.toISOString()
      const completedRecord = {
        ...updateDailyRecord(existing, existing.questions.length - 1, answers),
        completedAt,
      }
      const attempt = createAttempt('daily', existing.questions, answers, completionDate)
      return persist({
        ...state,
        attempts: [attempt, ...state.attempts],
        dailySessions: state.dailySessions.map((session) =>
          session.studyDate === studyDate ? completedRecord : session,
        ),
      })
    },
    [persist, state],
  )

  const streak = useMemo(() => calculateStreak(state.attempts), [state.attempts])

  return (
    <LearningContext.Provider
      value={{
        state,
        error,
        streak,
        saveSettings,
        saveDailyConfig,
        recordAttempt,
        toggleLearnedTable,
        clearHistory,
        ensureDailyPractice,
        replaceDailyPractice,
        saveDailyProgress,
        completeDailyPractice,
      }}
    >
      {children}
    </LearningContext.Provider>
  )
}
