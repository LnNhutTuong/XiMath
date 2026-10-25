import { describe, expect, it } from 'vitest'
import {
  answerRecordToList,
  createDailyPracticeRecord,
  generateDailyQuestions,
  getDailyStudyDate,
  updateDailyRecord,
  validateDailyConfig,
} from './dailyPractice'
import type { DailyPracticeConfig } from './learningStore'

const config: DailyPracticeConfig = {
  operators: ['+', '-'],
  questionCounts: { warmup: 10, practice: 10, challenge: 10 },
}

describe('daily practice question generation', () => {
  it('generates 30 correctly calculated questions in the selected stage ratios', () => {
    const questions = generateDailyQuestions(config)

    expect(questions).toHaveLength(30)
    expect(questions.slice(0, 10).every(({ difficulty }) => difficulty === 'warmup')).toBe(true)
    expect(questions.slice(10, 20).every(({ difficulty }) => difficulty === 'practice')).toBe(true)
    expect(questions.slice(20).every(({ difficulty }) => difficulty === 'challenge')).toBe(true)
    expect(
      questions.every(({ operandA, operandB, operator, answer }) => {
        const expected =
          operator === '+'
            ? operandA + operandB
            : operator === '-'
              ? operandA - operandB
              : operator === '×'
                ? operandA * operandB
                : operandA / operandB
        return answer === expected && answer >= 0 && answer <= 100
      }),
    ).toBe(true)
    expect(new Set(questions.map(({ id }) => id)).size).toBe(30)
  })

  it('supports customized question ratios and all selected operators', () => {
    const customized: DailyPracticeConfig = {
      operators: ['×'],
      questionCounts: { warmup: 5, practice: 15, challenge: 10 },
    }
    const questions = generateDailyQuestions(customized)

    expect(questions).toHaveLength(30)
    expect(questions.every(({ operator }) => operator === '×')).toBe(true)
    expect(validateDailyConfig(customized)).toBe('')
  })

  it('generates exact daily division questions', () => {
    const questions = generateDailyQuestions({
      operators: ['÷'],
      questionCounts: { warmup: 10, practice: 10, challenge: 10 },
    })
    expect(questions).toHaveLength(30)
    expect(
      questions.every(
        ({ operandA, operandB, operator, answer }) =>
          operator === '÷' && operandB > 0 && Number.isInteger(answer) && operandA / operandB === answer,
      ),
    ).toBe(true)
  })

  it('rejects invalid ratios and empty operation selections', () => {
    expect(
      validateDailyConfig({
        ...config,
        questionCounts: { warmup: 10, practice: 10, challenge: 9 },
      }),
    ).toContain('30 câu')
    expect(validateDailyConfig({ ...config, operators: [] })).toContain('ít nhất một')
  })

  it('uses the Vietnam study date across the local midnight boundary', () => {
    expect(getDailyStudyDate(new Date('2026-10-25T16:59:59.000Z'))).toBe('2026-10-25')
    expect(getDailyStudyDate(new Date('2026-10-25T17:00:00.000Z'))).toBe('2026-10-26')
  })

  it('restores saved answers and current question without marking unanswered questions correct', () => {
    const record = createDailyPracticeRecord('2026-10-25', config)
    const answers = {
      [record.questions[0].id]: record.questions[0].answer,
      [record.questions[1].id]: -999,
    }
    const updated = updateDailyRecord(record, 4, answers)
    const restoredAnswers = answerRecordToList(
      updated.questions,
      Object.fromEntries(
        updated.answers.flatMap(({ question, answer }) =>
          answer === null ? [] : [[question.id, answer] as const],
        ),
      ),
    )

    expect(updated.currentIndex).toBe(4)
    expect(restoredAnswers[0].answer).toBe(record.questions[0].answer)
    expect(restoredAnswers[1].answer).toBe(-999)
    expect(restoredAnswers[2].answer).toBeNull()
  })

  it('does not change completed daily records when progress is updated', () => {
    const record = createDailyPracticeRecord('2026-10-25', config)
    const completed = { ...record, completedAt: '2026-10-25T12:00:00.000Z' }

    expect(updateDailyRecord(completed, 8, {})).toBe(completed)
  })
})
