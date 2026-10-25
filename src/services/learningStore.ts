import type { ArithmeticOperator, Question } from '../features/question-generator/types'
import type { AnswerMode } from '../features/practice/PracticeSession'

export type DifficultySetting = 'warmup' | 'practice' | 'challenge'

export type LearningSettings = {
  operators: ArithmeticOperator[]
  operandDigitsA: number
  operandDigitsB: number
  maxResult: number
  questionCount: number
  allowNegative: boolean
  showAnswersImmediately: boolean
  answerMode: AnswerMode
  difficulty: DifficultySetting
}

function isDailyPracticeRecord(value: unknown): value is DailyPracticeRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const config = record.config as Record<string, unknown> | null
  const counts = config?.questionCounts as Record<string, unknown> | null
  const answers = Array.isArray(record.answers) ? record.answers : null
  const questions = Array.isArray(record.questions) ? record.questions : null
  const isQuestion = (candidate: unknown): candidate is Question => {
    if (!candidate || typeof candidate !== 'object') return false
    const question = candidate as Record<string, unknown>
    if (
      typeof question.id !== 'string' ||
      !Number.isSafeInteger(question.operandA) ||
      !Number.isSafeInteger(question.operandB) ||
      Number(question.operandA) < 0 ||
      Number(question.operandB) < 0 ||
      !isOperator(question.operator) ||
      !Number.isSafeInteger(question.answer) ||
      !['warmup', 'practice', 'challenge'].includes(String(question.difficulty))
    ) {
      return false
    }
    const expected =
      question.operator === '+'
        ? Number(question.operandA) + Number(question.operandB)
        : question.operator === '-'
          ? Number(question.operandA) - Number(question.operandB)
          : question.operator === '×'
            ? Number(question.operandA) * Number(question.operandB)
            : Number(question.operandA) / Number(question.operandB)
    return Number.isSafeInteger(expected) && expected === question.answer
  }
  const isStoredAnswer = (candidate: unknown) => {
    if (!candidate || typeof candidate !== 'object') return false
    const entry = candidate as Record<string, unknown>
    return (
      isQuestion(entry.question) &&
      (entry.answer === null || Number.isSafeInteger(entry.answer))
    )
  }

  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.studyDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.studyDate) &&
    config !== null &&
    Array.isArray(config.operators) &&
    config.operators.length > 0 &&
    config.operators.every(isOperator) &&
    new Set(config.operators).size === config.operators.length &&
    counts !== null &&
    Number.isInteger(counts.warmup) &&
    Number(counts.warmup) >= 0 &&
    Number.isInteger(counts.practice) &&
    Number(counts.practice) >= 0 &&
    Number.isInteger(counts.challenge) &&
    Number(counts.challenge) >= 0 &&
    Number(counts.warmup) + Number(counts.practice) + Number(counts.challenge) === 30 &&
    questions !== null &&
    questions.length === 30 &&
    questions.every(isQuestion) &&
    new Set(questions.map((question) => (question as Question).id)).size === 30 &&
    questions.every((question) =>
      (config.operators as ArithmeticOperator[]).includes((question as Question).operator),
    ) &&
    questions.filter((question) => (question as Question).difficulty === 'warmup').length ===
      Number(counts.warmup) &&
    questions.filter((question) => (question as Question).difficulty === 'practice').length ===
      Number(counts.practice) &&
    questions.filter((question) => (question as Question).difficulty === 'challenge').length ===
      Number(counts.challenge) &&
    answers !== null &&
    answers.length === 30 &&
    answers.every(isStoredAnswer) &&
    answers.every(
      (answer, index) =>
        (answer as AttemptAnswer).question.id === (questions[index] as Question).id &&
        (answer as AttemptAnswer).question.answer === (questions[index] as Question).answer,
    ) &&
    Number.isInteger(record.currentIndex) &&
    Number(record.currentIndex) >= 0 &&
    Number(record.currentIndex) <= 29 &&
    (record.completedAt === null ||
      (typeof record.completedAt === 'string' &&
        Number.isFinite(Date.parse(record.completedAt)) &&
        readStudyDate(new Date(record.completedAt)) === record.studyDate))
  )
}

export type AttemptAnswer = {
  question: Question
  answer: number | null
}

export type AttemptCategory =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'tables'
  | 'daily'
  | 'daily-retry'

export type DailyQuestionCounts = {
  warmup: number
  practice: number
  challenge: number
}

export type DailyPracticeConfig = {
  operators: ArithmeticOperator[]
  questionCounts: DailyQuestionCounts
}

export const defaultDailyPracticeConfig: DailyPracticeConfig = {
  operators: ['+', '-'],
  questionCounts: { warmup: 10, practice: 10, challenge: 10 },
}

export type DailyPracticeRecord = {
  id: string
  studyDate: string
  config: DailyPracticeConfig
  questions: Question[]
  currentIndex: number
  answers: AttemptAnswer[]
  completedAt: string | null
}

export type PracticeAttempt = {
  id: string
  category: AttemptCategory
  completedAt: string
  studyDate: string
  questionCount: number
  correctCount: number
  answers: AttemptAnswer[]
}

export type LearningState = {
  version: 1
  settings: LearningSettings
  dailyConfig: DailyPracticeConfig
  attempts: PracticeAttempt[]
  learnedTables: number[]
  dailySessions: DailyPracticeRecord[]
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const LEARNING_STORAGE_KEY = 'ximath.learning.v1'
export const LEGACY_TABLES_STORAGE_KEY = 'ximath.learned-tables.v1'

export const defaultLearningSettings: LearningSettings = {
  operators: ['+'],
  operandDigitsA: 1,
  operandDigitsB: 1,
  maxResult: 20,
  questionCount: 10,
  allowNegative: false,
  showAnswersImmediately: true,
  answerMode: 'choice',
  difficulty: 'warmup',
}

export function createDefaultLearningState(): LearningState {
  return {
    version: 1,
    settings: { ...defaultLearningSettings, operators: [...defaultLearningSettings.operators] },
    dailyConfig: {
      operators: [...defaultDailyPracticeConfig.operators],
      questionCounts: { ...defaultDailyPracticeConfig.questionCounts },
    },
    attempts: [],
    learnedTables: [],
    dailySessions: [],
  }
}

function isLearningState(value: unknown): value is LearningState {
  if (!value || typeof value !== 'object') return false
  const state = value as Record<string, unknown>
  return (
    state.version === 1 &&
    isSettings(state.settings) &&
    (state.dailyConfig === undefined || isDailyPracticeConfig(state.dailyConfig)) &&
    Array.isArray(state.attempts) &&
    state.attempts.every(isAttempt) &&
    Array.isArray(state.learnedTables) &&
    state.learnedTables.every(
      (table) => Number.isInteger(table) && Number(table) >= 2 && Number(table) <= 10,
    ) &&
    new Set(state.learnedTables).size === state.learnedTables.length &&
    (state.dailySessions === undefined ||
      (Array.isArray(state.dailySessions) &&
        state.dailySessions.every(isDailyPracticeRecord) &&
        new Set(state.dailySessions.map((session) => session.studyDate)).size ===
          state.dailySessions.length))
  )
}

function isOperator(value: unknown): value is ArithmeticOperator {
  return value === '+' || value === '-' || value === '×' || value === '÷'
}

function isDailyPracticeConfig(value: unknown): value is DailyPracticeConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Record<string, unknown>
  const counts = config.questionCounts as Record<string, unknown> | null
  return (
    Array.isArray(config.operators) &&
    config.operators.length > 0 &&
    config.operators.every(isOperator) &&
    new Set(config.operators).size === config.operators.length &&
    counts !== null &&
    Number.isInteger(counts.warmup) &&
    Number(counts.warmup) >= 0 &&
    Number.isInteger(counts.practice) &&
    Number(counts.practice) >= 0 &&
    Number.isInteger(counts.challenge) &&
    Number(counts.challenge) >= 0 &&
    Number(counts.warmup) + Number(counts.practice) + Number(counts.challenge) === 30
  )
}

function isSettings(value: unknown): value is LearningSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Record<string, unknown>
  return (
    Array.isArray(settings.operators) &&
    settings.operators.length > 0 &&
    new Set(settings.operators).size === settings.operators.length &&
    settings.operators.every(isOperator) &&
    Number.isInteger(settings.operandDigitsA) &&
    Number(settings.operandDigitsA) >= 1 &&
    Number(settings.operandDigitsA) <= 4 &&
    Number.isInteger(settings.operandDigitsB) &&
    Number(settings.operandDigitsB) >= 1 &&
    Number(settings.operandDigitsB) <= 4 &&
    Number.isSafeInteger(settings.maxResult) &&
    Number(settings.maxResult) >= 0 &&
    Number(settings.maxResult) <= 999_999 &&
    Number.isInteger(settings.questionCount) &&
    Number(settings.questionCount) >= 1 &&
    Number(settings.questionCount) <= 100 &&
    typeof settings.allowNegative === 'boolean' &&
    typeof settings.showAnswersImmediately === 'boolean' &&
    (settings.answerMode === 'choice' || settings.answerMode === 'input') &&
    (settings.difficulty === 'warmup' ||
      settings.difficulty === 'practice' ||
      settings.difficulty === 'challenge')
  )
}

function isAttempt(value: unknown): value is PracticeAttempt {
  if (!value || typeof value !== 'object') return false
  const attempt = value as Record<string, unknown>
  const isQuestion = (value: unknown): value is Question => {
    if (!value || typeof value !== 'object') return false
    const question = value as Record<string, unknown>
    const { operandA, operandB, operator, answer, difficulty } = question
    if (
      typeof question.id !== 'string' ||
      !Number.isSafeInteger(operandA) ||
      !Number.isSafeInteger(operandB) ||
      Number(operandA) < 0 ||
      Number(operandB) < 0 ||
      !isOperator(operator) ||
      !Number.isSafeInteger(answer) ||
      !['warmup', 'practice', 'challenge'].includes(String(difficulty))
    ) {
      return false
    }
    const expected =
      operator === '+'
        ? Number(operandA) + Number(operandB)
        : operator === '-'
          ? Number(operandA) - Number(operandB)
          : operator === '×'
            ? Number(operandA) * Number(operandB)
            : Number(operandA) / Number(operandB)
    return Number.isSafeInteger(expected) && expected === answer
  }
  const isAnswer = (answer: unknown) => {
    if (!answer || typeof answer !== 'object') return false
    const entry = answer as Record<string, unknown>
    return (
      isQuestion(entry.question) &&
      (entry.answer === null || Number.isSafeInteger(entry.answer))
    )
  }
  const answers = Array.isArray(attempt.answers) ? attempt.answers : null
  const answersAreValid = answers !== null && answers.every(isAnswer)
  const calculatedCorrectCount = answersAreValid && answers !== null
    ? answers.reduce<number>(
        (count, entry) =>
          count +
          ((entry as AttemptAnswer).answer ===
          (entry as AttemptAnswer).question.answer
            ? 1
            : 0),
        0
      )
    : -1
  const completedAt =
    typeof attempt.completedAt === 'string' ? new Date(attempt.completedAt) : null
  return (
    typeof attempt.id === 'string' &&
    ['addition', 'subtraction', 'multiplication', 'division', 'tables', 'daily', 'daily-retry'].includes(
      String(attempt.category),
    ) &&
    typeof attempt.completedAt === 'string' &&
    Number.isFinite(completedAt?.getTime()) &&
    typeof attempt.studyDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(attempt.studyDate) &&
    completedAt !== null &&
    readStudyDate(completedAt) === attempt.studyDate &&
    Number.isInteger(attempt.questionCount) &&
    Number(attempt.questionCount) > 0 &&
    Number.isInteger(attempt.correctCount) &&
    Number(attempt.correctCount) >= 0 &&
    Number(attempt.correctCount) <= Number(attempt.questionCount) &&
    Number(attempt.correctCount) === calculatedCorrectCount &&
    answersAreValid &&
    answers !== null &&
    answers.length === Number(attempt.questionCount) &&
    answersAreValid &&
    new Set(answers.map((entry) => (entry as AttemptAnswer).question.id)).size ===
      answers.length
  )
}

function parseLearnedTables(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter(
    (table): table is number => Number.isInteger(table) && table >= 2 && table <= 10,
  ))]
}

export function readStudyDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function loadLearningState(storage: StorageLike): {
  state: LearningState
  error: string
} {
  const defaults = createDefaultLearningState()
  try {
    const stored = storage.getItem(LEARNING_STORAGE_KEY)
    if (stored) {
      let parsed: unknown
      try {
        parsed = JSON.parse(stored)
      } catch {
        return {
          state: defaults,
          error: 'Dữ liệu học tập bị lỗi. Em có thể bắt đầu lại với cấu hình mặc định.',
        }
      }
      if (isLearningState(parsed)) {
        return {
          state: {
            ...parsed,
            dailyConfig: parsed.dailyConfig ?? {
              operators: [...defaultDailyPracticeConfig.operators],
              questionCounts: { ...defaultDailyPracticeConfig.questionCounts },
            },
            dailySessions: parsed.dailySessions ?? [],
          },
          error: '',
        }
      }
      return {
        state: defaults,
        error: 'Dữ liệu học tập không tương thích nên đã dùng cấu hình mặc định.',
      }
    }

    const legacyTables = storage.getItem(LEGACY_TABLES_STORAGE_KEY)
    if (legacyTables) {
      try {
        defaults.learnedTables = parseLearnedTables(JSON.parse(legacyTables))
      } catch {
        return {
          state: defaults,
          error: 'Dữ liệu bảng đã học bị lỗi. Em có thể đánh dấu lại sau khi học.',
        }
      }
    }
    return { state: defaults, error: '' }
  } catch {
    return {
      state: defaults,
      error: 'Không thể đọc dữ liệu trên thiết bị. Kiểm tra cài đặt bộ nhớ trình duyệt nhé.',
    }
  }
}

export function saveLearningState(storage: StorageLike, state: LearningState): string {
  if (!isLearningState(state)) {
    return 'Một số cài đặt hoặc dữ liệu chưa hợp lệ. Em hãy kiểm tra lại nhé.'
  }
  try {
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(state))
    return ''
  } catch {
    return 'Chưa lưu được thay đổi. Em hãy kiểm tra bộ nhớ hoặc cài đặt trình duyệt nhé.'
  }
}

export function clearLearningHistory(storage: StorageLike, state: LearningState): {
  state: LearningState
  error: string
} {
  const nextState = { ...state, attempts: [], learnedTables: [], dailySessions: [] }
  const error = saveLearningState(storage, nextState)
  if (error) return { state, error }
  try {
    storage.removeItem(LEGACY_TABLES_STORAGE_KEY)
  } catch {
    return {
      state: nextState,
      error: 'Đã xóa lịch sử, nhưng chưa xóa được dữ liệu bảng cũ.',
    }
  }
  return { state: nextState, error: '' }
}

export function calculateStreak(attempts: PracticeAttempt[], today = readStudyDate(new Date())): number {
  const days = new Set(attempts.map(({ studyDate }) => studyDate))
  let cursor = today
  if (!days.has(cursor)) {
    const yesterday = new Date(`${today}T00:00:00Z`)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    cursor = yesterday.toISOString().slice(0, 10)
    if (!days.has(cursor)) return 0
  }

  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    const previousDay = new Date(`${cursor}T00:00:00Z`)
    previousDay.setUTCDate(previousDay.getUTCDate() - 1)
    cursor = previousDay.toISOString().slice(0, 10)
  }
  return streak
}
