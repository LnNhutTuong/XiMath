import { generateQuestions } from '../features/question-generator/generateQuestions'
import type {
  ArithmeticOperator,
  Question,
  QuestionDifficulty,
  QuestionGeneratorConfig,
} from '../features/question-generator/types'
import type {
  AttemptAnswer,
  DailyPracticeConfig,
  DailyPracticeRecord,
  DailyQuestionCounts,
} from './learningStore'
import { defaultDailyPracticeConfig, readStudyDate } from './learningStore'

export const DEFAULT_DAILY_CONFIG = defaultDailyPracticeConfig

export function getDailyStudyDate(now = new Date()): string {
  return readStudyDate(now)
}

export function validateDailyConfig(config: DailyPracticeConfig): string {
  const { warmup, practice, challenge } = config.questionCounts
  if (
    !Number.isInteger(warmup) ||
    !Number.isInteger(practice) ||
    !Number.isInteger(challenge) ||
    warmup < 0 ||
    practice < 0 ||
    challenge < 0 ||
    warmup + practice + challenge !== 30
  ) {
    return 'Ba mức độ cần có tổng cộng đúng 30 câu nhé.'
  }
  if (
    config.operators.length === 0 ||
    config.operators.some((operator) => !['+', '-', '×', '÷'].includes(operator))
  ) {
    return 'Em hãy chọn ít nhất một loại phép tính.'
  }
  return ''
}

function difficultyConfig(
  difficulty: QuestionDifficulty,
  count: number,
  operators: readonly ArithmeticOperator[],
): QuestionGeneratorConfig {
  const range =
    difficulty === 'warmup'
      ? { min: 0, max: 10 }
      : difficulty === 'practice'
        ? { min: 0, max: 20 }
        : { min: 10, max: 50 }
  return {
    count,
    operators,
    operandA: range,
    operandB: range,
    maxResult: 100,
    allowNegative: false,
    difficulty,
  }
}

export function generateDailyQuestions(
  config: DailyPracticeConfig = DEFAULT_DAILY_CONFIG,
  random: () => number = Math.random,
): Question[] {
  const error = validateDailyConfig(config)
  if (error) throw new RangeError(error)

  const questions: Question[] = []
  const stages: [QuestionDifficulty, number][] = [
    ['warmup', config.questionCounts.warmup],
    ['practice', config.questionCounts.practice],
    ['challenge', config.questionCounts.challenge],
  ]

  for (const [difficulty, count] of stages) {
    if (count === 0) continue
    const stageQuestions = generateQuestions(
      difficultyConfig(difficulty, count, config.operators),
      random,
    )
    questions.push(...stageQuestions)
  }

  return questions.map((question, index) => ({
    ...question,
    id: `daily-question-${index + 1}`,
  }))
}

export function createDailyPracticeRecord(
  studyDate: string,
  config: DailyPracticeConfig = DEFAULT_DAILY_CONFIG,
  random: () => number = Math.random,
): DailyPracticeRecord {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(studyDate)) {
    throw new RangeError('Ngày học không hợp lệ.')
  }
  const questions = generateDailyQuestions(config, random)
  return {
    id: `${studyDate}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studyDate,
    config: {
      operators: [...config.operators],
      questionCounts: { ...config.questionCounts },
    },
    questions,
    currentIndex: 0,
    answers: questions.map((question): AttemptAnswer => ({ question, answer: null })),
    completedAt: null,
  }
}

export function answersToRecord(answers: AttemptAnswer[]): Record<string, number> {
  return Object.fromEntries(
    answers.flatMap(({ question, answer }) =>
      answer === null ? [] : [[question.id, answer] as const],
    ),
  )
}

export function answerRecordToList(
  questions: Question[],
  answers: Record<string, number>,
): AttemptAnswer[] {
  return questions.map((question) => ({
    question,
    answer: Number.isSafeInteger(answers[question.id]) ? answers[question.id] : null,
  }))
}

export function updateDailyRecord(
  record: DailyPracticeRecord,
  currentIndex: number,
  answers: Record<string, number>,
): DailyPracticeRecord {
  if (record.completedAt) return record
  const boundedIndex = Math.min(Math.max(Math.trunc(currentIndex), 0), record.questions.length - 1)
  return {
    ...record,
    currentIndex: boundedIndex,
    answers: answerRecordToList(record.questions, answers),
  }
}

export function getDailyQuestionCounts(config: DailyPracticeConfig): DailyQuestionCounts {
  return { ...config.questionCounts }
}
