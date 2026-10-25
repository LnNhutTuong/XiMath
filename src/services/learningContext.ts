import { createContext } from 'react'
import type { Question } from '../features/question-generator/types'
import type {
  DailyPracticeRecord,
  DailyPracticeConfig,
  LearningSettings,
  LearningState,
  PracticeAttempt,
} from './learningStore'

export type LearningContextValue = {
  state: LearningState
  error: string
  streak: number
  saveSettings: (settings: LearningSettings) => boolean
  saveDailyConfig: (config: DailyPracticeConfig) => boolean
  recordAttempt: (
    category: PracticeAttempt['category'],
    questions: Question[],
    answers: Record<string, number>,
  ) => boolean
  toggleLearnedTable: (table: number) => boolean
  clearHistory: () => boolean
  ensureDailyPractice: (record: DailyPracticeRecord) => boolean
  replaceDailyPractice: (record: DailyPracticeRecord) => boolean
  saveDailyProgress: (
    studyDate: string,
    currentIndex: number,
    answers: Record<string, number>,
  ) => boolean
  completeDailyPractice: (
    studyDate: string,
    answers: Record<string, number>,
  ) => boolean
}

export const LearningContext = createContext<LearningContextValue | null>(null)
