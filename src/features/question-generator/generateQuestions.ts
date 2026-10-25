import type {
  ArithmeticOperator,
  OperandRange,
  Question,
  QuestionDifficulty,
  QuestionGeneratorConfig,
} from './types'

type Candidate = Omit<Question, 'id'>
type NumberRange = { min: number; max: number }

const MAX_SAFE_RESULT = Number.MAX_SAFE_INTEGER
const POOL_LIMIT = 50_000

function assertRange(range: OperandRange, label: string): void {
  if (
    !Number.isSafeInteger(range.min) ||
    !Number.isSafeInteger(range.max) ||
    range.min < 0 ||
    range.min > range.max
  ) {
    throw new RangeError(`${label} phải là khoảng số nguyên không âm hợp lệ.`)
  }
}

function validateConfig(config: QuestionGeneratorConfig): void {
  if (!Number.isSafeInteger(config.count) || config.count < 1) {
    throw new RangeError('Số câu hỏi phải là số nguyên lớn hơn 0.')
  }
  if (config.operators.length === 0) {
    throw new RangeError('Hãy chọn ít nhất một phép tính.')
  }
  if (config.operators.some((operator) => !['+', '-', '×'].includes(operator))) {
    throw new RangeError('Có phép tính không được hỗ trợ.')
  }
  if (
    config.maxResult !== undefined &&
    (!Number.isSafeInteger(config.maxResult) || config.maxResult < 0)
  ) {
    throw new RangeError('Giới hạn kết quả phải là số nguyên không âm.')
  }
  assertRange(config.operandA, 'Toán hạng thứ nhất')
  assertRange(config.operandB, 'Toán hạng thứ hai')
}

function randomInteger(min: number, max: number, random: () => number): number {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Bộ sinh số ngẫu nhiên phải trả về giá trị từ 0 đến nhỏ hơn 1.')
  }
  return min + Math.floor(value * (max - min + 1))
}

function shuffle<T>(items: T[], random: () => number): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const otherIndex = randomInteger(0, index, random)
    ;[items[index], items[otherIndex]] = [items[otherIndex], items[index]]
  }
}

function resultLimit(config: QuestionGeneratorConfig): number {
  return Math.min(config.maxResult ?? MAX_SAFE_RESULT, MAX_SAFE_RESULT)
}

function validOperandARange(
  operator: ArithmeticOperator,
  config: QuestionGeneratorConfig,
): NumberRange | null {
  const { operandA, operandB, allowNegative = false } = config
  const limit = resultLimit(config)
  let min = operandA.min
  let max = operandA.max

  if (operator === '+') {
    max = Math.min(max, limit - operandB.min)
  } else if (operator === '-') {
    if (allowNegative) {
      min = Math.max(min, operandB.min - limit)
      max = Math.min(max, Math.min(MAX_SAFE_RESULT, operandB.max + limit))
    } else {
      min = Math.max(min, operandB.min)
      max = Math.min(max, Math.min(MAX_SAFE_RESULT, operandB.max + limit))
    }
  } else if (operandB.min > 0) {
    max = Math.min(max, Math.floor(limit / operandB.min))
  }

  return min <= max ? { min, max } : null
}

function validOperandBRange(
  operator: ArithmeticOperator,
  operandA: number,
  config: QuestionGeneratorConfig,
): NumberRange | null {
  const { operandB, allowNegative = false } = config
  const limit = resultLimit(config)
  let min = operandB.min
  let max = operandB.max

  if (operator === '+') {
    max = Math.min(max, limit - operandA)
  } else if (operator === '-') {
    min = Math.max(min, operandA - limit)
    if (!allowNegative) max = Math.min(max, operandA)
    else max = Math.min(max, Math.min(MAX_SAFE_RESULT, operandA + limit))
  } else if (operandA > 0) {
    max = Math.min(max, Math.floor(limit / operandA))
  }

  return min <= max ? { min, max } : null
}

function makeCandidate(
  operator: ArithmeticOperator,
  operandA: number,
  operandB: number,
  difficulty: QuestionDifficulty,
): Candidate {
  const answer =
    operator === '+'
      ? operandA + operandB
      : operator === '-'
        ? operandA - operandB
        : operandA * operandB

  return { operandA, operandB, operator, answer, difficulty }
}

function candidateKey(candidate: Candidate): string {
  const { operandA, operandB, operator } = candidate
  const [first, second] =
    operator === '-' || operandA <= operandB
      ? [operandA, operandB]
      : [operandB, operandA]
  return `${operator}:${first}:${second}`
}

function isValidCandidate(candidate: Candidate, config: QuestionGeneratorConfig): boolean {
  if (
    !Number.isSafeInteger(candidate.answer) ||
    (!config.allowNegative && candidate.answer < 0) ||
    Math.abs(candidate.answer) > resultLimit(config)
  ) {
    return false
  }
  return true
}

function createCandidatePool(
  operator: ArithmeticOperator,
  config: QuestionGeneratorConfig,
  difficulty: QuestionDifficulty,
): Candidate[] {
  const pool: Candidate[] = []
  const seen = new Set<string>()
  for (let operandA = config.operandA.min; operandA <= config.operandA.max; operandA += 1) {
    const operandBRange = validOperandBRange(operator, operandA, config)
    if (!operandBRange) continue
    for (let operandB = operandBRange.min; operandB <= operandBRange.max; operandB += 1) {
      const candidate = makeCandidate(operator, operandA, operandB, difficulty)
      if (!isValidCandidate(candidate, config)) continue
      const key = candidateKey(candidate)
      if (seen.has(key)) continue
      seen.add(key)
      pool.push(candidate)
    }
  }
  return pool
}

function createRandomCandidate(
  operator: ArithmeticOperator,
  config: QuestionGeneratorConfig,
  difficulty: QuestionDifficulty,
  random: () => number,
): Candidate {
  const operandARange = validOperandARange(operator, config)
  if (!operandARange) {
    throw new RangeError(`Không thể tạo phép ${operator} trong phạm vi đã chọn.`)
  }

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const operandA = randomInteger(operandARange.min, operandARange.max, random)
    const operandBRange = validOperandBRange(operator, operandA, config)
    if (!operandBRange) continue
    const operandB = randomInteger(operandBRange.min, operandBRange.max, random)
    const candidate = makeCandidate(operator, operandA, operandB, difficulty)
    if (isValidCandidate(candidate, config)) return candidate
  }

  for (let operandA = operandARange.min; operandA <= operandARange.max; operandA += 1) {
    const operandBRange = validOperandBRange(operator, operandA, config)
    if (!operandBRange) continue
    const operandB = operandBRange.min
    const candidate = makeCandidate(operator, operandA, operandB, difficulty)
    if (isValidCandidate(candidate, config)) return candidate
  }

  throw new RangeError(`Không thể tạo phép ${operator} trong phạm vi đã chọn.`)
}

export function generateQuestions(
  config: QuestionGeneratorConfig,
  random: () => number = Math.random,
): Question[] {
  validateConfig(config)
  const difficulty = config.difficulty ?? 'practice'
  const uniqueOperators = [...new Set(config.operators)]
  const rangesAreSmall =
    (config.operandA.max - config.operandA.min + 1) *
      (config.operandB.max - config.operandB.min + 1) *
      uniqueOperators.length <=
    POOL_LIMIT

  const pools = new Map<ArithmeticOperator, Candidate[]>()
  for (const operator of uniqueOperators) {
    if (!validOperandARange(operator, config)) {
      throw new RangeError(`Không thể tạo phép ${operator} trong phạm vi đã chọn.`)
    }
    if (rangesAreSmall) {
      const pool = createCandidatePool(operator, config, difficulty)
      if (pool.length === 0) {
        throw new RangeError(`Không thể tạo phép ${operator} trong phạm vi đã chọn.`)
      }
      shuffle(pool, random)
      pools.set(operator, pool)
    }
  }

  const poolIndexes = new Map<ArithmeticOperator, number>()
  const usedKeys = new Set<string>()
  const questions: Question[] = []

  for (let index = 0; index < config.count; index += 1) {
    let candidate: Candidate | undefined
    const availableOperators = uniqueOperators.filter((operator) => {
      const pool = pools.get(operator)
      return !pool || (poolIndexes.get(operator) ?? 0) < pool.length
    })

    if (availableOperators.length > 0) {
      const operator = availableOperators[randomInteger(0, availableOperators.length - 1, random)]
      const pool = pools.get(operator)
      if (pool) {
        const poolIndex = poolIndexes.get(operator) ?? 0
        candidate = pool[poolIndex]
        poolIndexes.set(operator, poolIndex + 1)
      }
    }

    if (!candidate) {
      for (let attempt = 0; attempt < 48; attempt += 1) {
        const operator = uniqueOperators[randomInteger(0, uniqueOperators.length - 1, random)]
        const next = createRandomCandidate(operator, config, difficulty, random)
        if (!usedKeys.has(candidateKey(next))) {
          candidate = next
          break
        }
      }
    }

    if (!candidate) {
      const operator = uniqueOperators[randomInteger(0, uniqueOperators.length - 1, random)]
      candidate = createRandomCandidate(operator, config, difficulty, random)
    }

    usedKeys.add(candidateKey(candidate))
    questions.push({ ...candidate, id: `question-${index + 1}` })
  }

  return questions
}
