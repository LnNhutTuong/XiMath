import { useState, type ReactNode } from 'react'
import { AlertCircle, Play, RotateCcw, Sparkles } from 'lucide-react'
import PracticeSession, {
  type AnswerMode,
  type PracticeMode,
} from '../features/practice/PracticeSession'
import { generateQuestions } from '../features/question-generator/generateQuestions'
import type {
  ArithmeticOperator,
  Question,
  QuestionDifficulty,
  QuestionGeneratorConfig,
} from '../features/question-generator/types'

type PracticeKind = 'addition' | 'subtraction' | 'multiplication'
type AdditionLevel = 'under-10' | 'under-20' | 'no-carry' | 'with-carry' | 'advanced'
type SubtractionLevel = 'any' | 'without-borrow' | 'with-borrow'

type ArithmeticPracticePageProps = {
  kind: PracticeKind
}

const countOptions = [5, 10, 15, 20, 30]
const digitOptions = [1, 2, 3]

const pageContent: Record<
  PracticeKind,
  { title: string; description: string; emoji: string; operator: ArithmeticOperator }
> = {
  addition: {
    title: 'Luyện phép cộng',
    description: 'Chọn phạm vi phù hợp rồi cùng tính nhẩm nhé!',
    emoji: '🍎',
    operator: '+',
  },
  subtraction: {
    title: 'Luyện phép trừ',
    description: 'Tập trừ từng bước, thật bình tĩnh và chính xác.',
    emoji: '🎈',
    operator: '-',
  },
  multiplication: {
    title: 'Luyện phép nhân',
    description: 'Khám phá các nhóm bằng nhau qua phép nhân.',
    emoji: '⭐',
    operator: '×',
  },
}

function operandRange(digits: number) {
  if (digits === 1) return { min: 0, max: 9 }
  return { min: 10 ** (digits - 1), max: 10 ** digits - 1 }
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

const selectClass =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'

export default function ArithmeticPracticePage({ kind }: ArithmeticPracticePageProps) {
  const content = pageContent[kind]
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [error, setError] = useState('')
  const [count, setCount] = useState(10)
  const [answerMode, setAnswerMode] = useState<AnswerMode>('choice')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('practice')
  const [digitsA, setDigitsA] = useState(1)
  const [digitsB, setDigitsB] = useState(1)
  const [additionLevel, setAdditionLevel] = useState<AdditionLevel>('under-10')
  const [subtractionLevel, setSubtractionLevel] = useState<SubtractionLevel>('any')
  const [maxResult, setMaxResult] = useState(200)
  const [allowNegative, setAllowNegative] = useState(false)
  const [table, setTable] = useState(0)

  function buildConfig(): QuestionGeneratorConfig {
    const base: QuestionGeneratorConfig = {
      count,
      operators: [content.operator],
      operandA: operandRange(digitsA),
      operandB: operandRange(digitsB),
      difficulty: (count <= 10 ? 'warmup' : count <= 20 ? 'practice' : 'challenge') as QuestionDifficulty,
    }

    if (kind === 'addition') {
      if (additionLevel === 'under-10') {
        return {
          ...base,
          operandA: { min: 0, max: 9 },
          operandB: { min: 0, max: 9 },
          maxResult: 10,
        }
      }
      if (additionLevel === 'under-20') {
        return {
          ...base,
          operandA: { min: 0, max: 19 },
          operandB: { min: 0, max: 19 },
          maxResult: 20,
        }
      }
      if (additionLevel === 'no-carry' || additionLevel === 'with-carry') {
        return {
          ...base,
          operandA: { min: 10, max: 99 },
          operandB: { min: 10, max: 99 },
          maxResult: 198,
          carryMode: additionLevel === 'no-carry' ? 'without-carry' : 'with-carry',
        }
      }
      return { ...base, maxResult }
    }

    if (kind === 'subtraction') {
      return {
        ...base,
        maxResult,
        allowNegative,
        ...(subtractionLevel === 'any' ? {} : {
          borrowMode: subtractionLevel,
        }),
      }
    }

    return {
      ...base,
      operandA: table === 0 ? { min: 2, max: 10 } : { min: table, max: table },
      operandB: { min: 1, max: 10 },
      maxResult: 100,
    }
  }

  function startPractice() {
    try {
      const nextQuestions = generateQuestions(buildConfig())
      setQuestions(nextQuestions)
      setError('')
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Chưa tạo được bài tập. Em hãy kiểm tra lại phạm vi nhé.',
      )
    }
  }

  function resetPractice() {
    setQuestions(null)
    setError('')
  }

  if (questions) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">{content.emoji} Góc luyện tập</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800">{content.title}</h1>
          </div>
          <button
            type="button"
            onClick={resetPractice}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 font-bold text-slate-500 outline-none hover:bg-white focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Đổi cấu hình
          </button>
        </div>
        <PracticeSession
          questions={questions}
          answerMode={answerMode}
          practiceMode={practiceMode}
          onRestart={startPractice}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-[26px] bg-gradient-to-br from-[#e2f7eb] to-[#eef5ff] p-6 sm:p-8">
        <span className="text-4xl" aria-hidden="true">{content.emoji}</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800">
          {content.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          {content.description}
        </p>
      </header>

      <section className="rounded-[26px] border border-slate-100 bg-white p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-extrabold text-slate-800">Tùy chỉnh bài tập</h2>
            <p className="mt-0.5 text-xs text-slate-400">Em có thể thay đổi bất cứ lúc nào.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {kind === 'addition' && (
            <>
              <Field label="Mức độ phép cộng">
                <select
                  className={selectClass}
                  value={additionLevel}
                  onChange={(event) => setAdditionLevel(event.target.value as AdditionLevel)}
                >
                  <option value="under-10">Tổng không vượt quá 10</option>
                  <option value="under-20">Tổng không vượt quá 20</option>
                  <option value="no-carry">Cộng hai chữ số không nhớ</option>
                  <option value="with-carry">Cộng hai chữ số có nhớ</option>
                  <option value="advanced">Cấu hình nâng cao</option>
                </select>
              </Field>
              {additionLevel === 'advanced' && (
                <>
                  <Field label="Số chữ số toán hạng thứ nhất">
                    <select className={selectClass} value={digitsA} onChange={(event) => setDigitsA(Number(event.target.value))}>
                      {digitOptions.map((digit) => <option key={digit} value={digit}>{digit} chữ số</option>)}
                    </select>
                  </Field>
                  <Field label="Số chữ số toán hạng thứ hai">
                    <select className={selectClass} value={digitsB} onChange={(event) => setDigitsB(Number(event.target.value))}>
                      {digitOptions.map((digit) => <option key={digit} value={digit}>{digit} chữ số</option>)}
                    </select>
                  </Field>
                  <Field label="Giới hạn tổng">
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={maxResult}
                      onChange={(event) => setMaxResult(Number(event.target.value))}
                      className={selectClass}
                    />
                  </Field>
                </>
              )}
            </>
          )}

          {kind === 'subtraction' && (
            <>
              <Field label="Độ khó phép trừ">
                <select
                  className={selectClass}
                  value={subtractionLevel}
                  onChange={(event) => setSubtractionLevel(event.target.value as SubtractionLevel)}
                >
                  <option value="any">Luyện phép trừ tổng hợp</option>
                  <option value="without-borrow">Phép trừ không mượn</option>
                  <option value="with-borrow">Phép trừ có mượn</option>
                </select>
              </Field>
              <Field label="Số chữ số của số bị trừ">
                <select className={selectClass} value={digitsA} onChange={(event) => setDigitsA(Number(event.target.value))}>
                  {digitOptions.map((digit) => <option key={digit} value={digit}>{digit} chữ số</option>)}
                </select>
              </Field>
              <Field label="Số chữ số của số trừ">
                <select className={selectClass} value={digitsB} onChange={(event) => setDigitsB(Number(event.target.value))}>
                  {digitOptions.map((digit) => <option key={digit} value={digit}>{digit} chữ số</option>)}
                </select>
              </Field>
              <Field label="Giới hạn kết quả">
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={maxResult}
                  onChange={(event) => setMaxResult(Number(event.target.value))}
                  className={selectClass}
                />
              </Field>
              <label className="flex min-h-11 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={allowNegative}
                  onChange={(event) => setAllowNegative(event.target.checked)}
                  className="size-4 accent-emerald-600"
                />
                Cho phép kết quả âm
              </label>
            </>
          )}

          {kind === 'multiplication' && (
            <Field label="Bảng nhân">
              <select className={selectClass} value={table} onChange={(event) => setTable(Number(event.target.value))}>
                <option value={0}>Luyện hỗn hợp bảng 2–10</option>
                {Array.from({ length: 9 }, (_, index) => index + 2).map((number) => (
                  <option key={number} value={number}>Bảng nhân {number}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Số lượng câu hỏi">
            <select className={selectClass} value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {countOptions.map((option) => <option key={option} value={option}>{option} câu</option>)}
            </select>
          </Field>
          <Field label="Cách trả lời">
            <select className={selectClass} value={answerMode} onChange={(event) => setAnswerMode(event.target.value as AnswerMode)}>
              <option value="choice">Chọn đáp án</option>
              <option value="input">Nhập kết quả</option>
            </select>
          </Field>
          <Field label="Chế độ">
            <select className={selectClass} value={practiceMode} onChange={(event) => setPracticeMode(event.target.value as PracticeMode)}>
              <option value="practice">Luyện tập (xem phản hồi ngay)</option>
              <option value="test">Kiểm tra (xem đáp án sau khi nộp)</option>
            </select>
          </Field>
        </div>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={startPractice}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-5 font-extrabold text-white outline-none transition hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          <Play size={18} fill="currentColor" aria-hidden="true" />
          Bắt đầu luyện tập
        </button>
      </section>
    </div>
  )
}
