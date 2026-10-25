import { describe, expect, it } from 'vitest'
import { generateQuestions } from './generateQuestions'
import type { QuestionGeneratorConfig } from './types'

const baseConfig: QuestionGeneratorConfig = {
  count: 10,
  operators: ['+'],
  operandA: { min: 0, max: 9 },
  operandB: { min: 0, max: 9 },
}

describe('generateQuestions', () => {
  it('generates addition answers from the operands', () => {
    const questions = generateQuestions(baseConfig)

    expect(questions).toHaveLength(10)
    expect(questions.every((question) => question.answer === question.operandA + question.operandB)).toBe(
      true,
    )
  })

  it('respects operand digit ranges and the maximum result', () => {
    const questions = generateQuestions({
      ...baseConfig,
      count: 30,
      operandA: { min: 10, max: 99 },
      operandB: { min: 10, max: 99 },
      maxResult: 120,
    })

    expect(
      questions.every(
        ({ operandA, operandB, answer }) =>
          operandA >= 10 &&
          operandA <= 99 &&
          operandB >= 10 &&
          operandB <= 99 &&
          answer <= 120,
      ),
    ).toBe(true)
  })

  it('generates subtraction without negative answers by default', () => {
    const questions = generateQuestions({
      ...baseConfig,
      operators: ['-'],
      operandA: { min: 0, max: 20 },
      operandB: { min: 0, max: 20 },
    })

    expect(questions.every(({ operandA, operandB, answer }) => answer === operandA - operandB && answer >= 0)).toBe(
      true,
    )
  })

  it('allows negative subtraction answers only when configured', () => {
    const questions = generateQuestions(
      {
        ...baseConfig,
        count: 1,
        operators: ['-'],
        operandA: { min: 0, max: 0 },
        operandB: { min: 1, max: 1 },
        allowNegative: true,
      },
      () => 0,
    )

    expect(questions[0].answer).toBe(-1)
  })

  it('enforces the result limit for subtraction and multiplication', () => {
    for (const operator of ['-', '×'] as const) {
      const questions = generateQuestions({
        ...baseConfig,
        count: 20,
        operators: [operator],
        operandA: { min: 0, max: 12 },
        operandB: { min: 0, max: 12 },
        maxResult: 15,
      })

      expect(questions.every(({ answer }) => Math.abs(answer) <= 15)).toBe(true)
    }
  })

  it('generates multiplication answers from the operands', () => {
    const questions = generateQuestions({
      ...baseConfig,
      operators: ['×'],
      maxResult: 81,
    })
    expect(questions.every(({ answer, operandA, operandB }) => answer === operandA * operandB)).toBe(
      true,
    )
  })

  it('generates exact division questions with non-zero divisors', () => {
    const questions = generateQuestions({
      ...baseConfig,
      count: 20,
      operators: ['÷'],
      operandA: { min: 0, max: 30 },
      operandB: { min: 0, max: 10 },
      maxResult: 10,
    })

    expect(
      questions.every(
        ({ operandA, operandB, answer }) =>
          operandB > 0 &&
          Number.isInteger(answer) &&
          operandA / operandB === answer &&
          answer <= 10,
      ),
    ).toBe(true)
  })

  it('rejects division ranges with no positive divisor', () => {
    expect(() =>
      generateQuestions({
        ...baseConfig,
        count: 1,
        operators: ['÷'],
        operandA: { min: 0, max: 5 },
        operandB: { min: 0, max: 0 },
      }),
    ).toThrow('Không thể tạo phép ÷')
  })

  it('can restrict two-digit addition to questions with or without carrying', () => {
    const common = {
      ...baseConfig,
      count: 15,
      operandA: { min: 10, max: 99 },
      operandB: { min: 10, max: 99 },
      maxResult: 198,
    }
    const withoutCarry = generateQuestions({ ...common, carryMode: 'without-carry' })
    const withCarry = generateQuestions({ ...common, carryMode: 'with-carry' })

    expect(
      withoutCarry.every(({ operandA, operandB }) => (operandA % 10) + (operandB % 10) < 10),
    ).toBe(true)
    expect(
      withCarry.every(({ operandA, operandB }) => (operandA % 10) + (operandB % 10) >= 10),
    ).toBe(true)
  })

  it('can restrict subtraction to questions with or without borrowing', () => {
    const common = {
      ...baseConfig,
      count: 15,
      operators: ['-'] as const,
      operandA: { min: 10, max: 99 },
      operandB: { min: 10, max: 99 },
      maxResult: 89,
    }
    const withoutBorrow = generateQuestions({ ...common, borrowMode: 'without-borrow' })
    const withBorrow = generateQuestions({ ...common, borrowMode: 'with-borrow' })

    expect(
      withoutBorrow.every(({ operandA, operandB }) => operandA % 10 >= operandB % 10),
    ).toBe(true)
    expect(
      withBorrow.every(({ operandA, operandB }) => operandA % 10 < operandB % 10),
    ).toBe(true)
  })

  it('supports mixed operations and sets the requested difficulty', () => {
    const questions = generateQuestions({
      ...baseConfig,
      count: 30,
      operators: ['+', '-', '×'],
      operandA: { min: 1, max: 10 },
      operandB: { min: 1, max: 10 },
      maxResult: 100,
      difficulty: 'challenge',
    })

    expect(questions).toHaveLength(30)
    expect(new Set(questions.map(({ operator }) => operator))).toEqual(new Set(['+', '-', '×']))
    expect(questions.every(({ difficulty }) => difficulty === 'challenge')).toBe(true)
    expect(new Set(questions.map(({ id }) => id)).size).toBe(30)
  })

  it('avoids duplicate questions when the configured range has enough choices', () => {
    const questions = generateQuestions({
      ...baseConfig,
      count: 6,
      operandA: { min: 1, max: 4 },
      operandB: { min: 1, max: 4 },
    })

    expect(new Set(questions.map(({ operandA, operandB }) => `${operandA}+${operandB}`)).size).toBe(6)
  })

  it('keeps valid commutative questions when the operand ranges differ', () => {
    const questions = generateQuestions({
      ...baseConfig,
      count: 1,
      operandA: { min: 9, max: 9 },
      operandB: { min: 2, max: 2 },
    })

    expect(questions[0]).toMatchObject({ operandA: 9, operandB: 2, answer: 11 })
  })

  it('returns the requested count without an unbounded retry for tiny ranges', () => {
    const questions = generateQuestions({
      ...baseConfig,
      count: 8,
      operandA: { min: 2, max: 2 },
      operandB: { min: 3, max: 3 },
    })

    expect(questions).toHaveLength(8)
    expect(questions.every(({ answer }) => answer === 5)).toBe(true)
  })

  it('throws a useful error for an impossible operator and invalid ranges', () => {
    expect(() =>
      generateQuestions({
        ...baseConfig,
        operators: ['-'],
        operandA: { min: 0, max: 2 },
        operandB: { min: 5, max: 8 },
      }),
    ).toThrow('Không thể tạo phép -')

    expect(() =>
      generateQuestions({ ...baseConfig, operandA: { min: 4, max: 2 } }),
    ).toThrow('Toán hạng thứ nhất')
  })

  it('rejects a random source outside the expected range', () => {
    expect(() => generateQuestions({ ...baseConfig, count: 1 }, () => 1)).toThrow(
      'Bộ sinh số ngẫu nhiên',
    )
  })

  it('rejects excessively large question sets', () => {
    expect(() => generateQuestions({ ...baseConfig, count: 101 })).toThrow(
      'Số câu hỏi phải từ 1 đến 100.',
    )
  })
})
