import { describe, expect, it } from 'vitest'
import { createAnswerChoices } from './answerChoices'

describe('createAnswerChoices', () => {
  it('returns exactly four distinct non-negative options near zero', () => {
    const choices = createAnswerChoices(2, () => 0)
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain(2)
    expect(choices.every((choice) => choice >= 0)).toBe(true)
  })

  it('supports a negative correct answer', () => {
    const choices = createAnswerChoices(-2, () => 0)
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain(-2)
  })
})
