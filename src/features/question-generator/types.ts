export type ArithmeticOperator = '+' | '-' | '×' | '÷'
export type QuestionDifficulty = 'warmup' | 'practice' | 'challenge'

export type Question = {
  id: string
  operandA: number
  operandB: number
  operator: ArithmeticOperator
  answer: number
  difficulty: QuestionDifficulty
}

export type OperandRange = {
  min: number
  max: number
}

export type QuestionGeneratorConfig = {
  count: number
  operators: readonly ArithmeticOperator[]
  operandA: OperandRange
  operandB: OperandRange
  maxResult?: number
  allowNegative?: boolean
  carryMode?: 'with-carry' | 'without-carry'
  borrowMode?: 'with-borrow' | 'without-borrow'
  difficulty?: QuestionDifficulty
}
