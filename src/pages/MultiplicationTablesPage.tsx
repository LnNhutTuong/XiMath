import { useState } from 'react'
import { Check, Dice5, Star, Table2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import PracticeSession, {
  type AnswerMode,
} from '../features/practice/PracticeSession'
import { generateQuestions } from '../features/question-generator/generateQuestions'
import type { Question } from '../features/question-generator/types'
import { useLearning } from '../services/useLearning'

const tableNumbers = Array.from({ length: 9 }, (_, index) => index + 2)

export default function MultiplicationTablesPage() {
  const { state, recordAttempt, toggleLearnedTable } = useLearning()
  const [selectedTable, setSelectedTable] = useState(2)
  const [practiceQuestions, setPracticeQuestions] = useState<Question[] | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const [answerMode, setAnswerMode] = useState<AnswerMode>(state.settings.answerMode)
  const [mixedPractice, setMixedPractice] = useState(false)
  const [error, setError] = useState('')
  const isLearned = state.learnedTables.includes(selectedTable)

  function toggleLearned() {
    if (toggleLearnedTable(selectedTable)) setError('')
  }

  function startRandomPractice() {
    try {
      const questions = generateQuestions({
        count: state.settings.questionCount,
        operators: ['×'],
        operandA: mixedPractice
          ? { min: 2, max: 10 }
          : { min: selectedTable, max: selectedTable },
        operandB: { min: 1, max: 10 },
        maxResult: state.settings.maxResult,
        difficulty: state.settings.difficulty,
      })
      setPracticeQuestions(questions)
      setSessionKey((current) => current + 1)
      setError('')
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Chưa tạo được bài luyện tập. Em thử lại nhé.',
      )
    }
  }

  if (practiceQuestions) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">🎲 Luyện tập ngẫu nhiên</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800">
              {mixedPractice ? 'Bảng nhân hỗn hợp' : `Bảng nhân ${selectedTable}`}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPracticeQuestions(null)}
            className="min-h-10 rounded-xl px-3 font-bold text-slate-500 outline-none hover:bg-white focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            Chọn bảng khác
          </button>
        </div>
        <PracticeSession
          key={sessionKey}
          questions={practiceQuestions}
          answerMode={answerMode}
          practiceMode="practice"
          onRestart={startRandomPractice}
          onComplete={(completedQuestions, answers) =>
            recordAttempt('tables', completedQuestions, answers)
          }
          showFeedback={state.settings.showAnswersImmediately}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-[26px] bg-gradient-to-br from-[#e8e4ff] via-[#f4f1ff] to-[#edf6ff] p-6 sm:p-8">
        <span className="text-4xl" aria-hidden="true">📚</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800">
          Bảng cửu chương
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Chọn một bảng để xem phép nhân, rồi thử luyện tập ngẫu nhiên nhé!
        </p>
      </header>

      <section className="rounded-[26px] border border-slate-100 bg-white p-5 sm:p-8">
        <div className="flex items-center gap-2">
          <Table2 size={20} className="text-violet-600" aria-hidden="true" />
          <h2 className="font-extrabold text-slate-800">Chọn bảng nhân</h2>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {tableNumbers.map((table) => {
            const selected = table === selectedTable
            const learned = state.learnedTables.includes(table)
            return (
              <button
                key={table}
                type="button"
                onClick={() => setSelectedTable(table)}
                aria-pressed={selected}
                className={[
                  'relative min-h-12 rounded-xl text-base font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-violet-200',
                  selected
                    ? 'bg-violet-600 text-white'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100',
                ].join(' ')}
              >
                {table}
                {learned && (
                  <Check
                    size={14}
                    className={`absolute right-1.5 top-1.5 ${selected ? 'text-white' : 'text-emerald-600'}`}
                    aria-label="Đã đánh dấu đã học"
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-500">
            {state.learnedTables.length}/9 bảng đã đánh dấu đã học
          </p>
          <button
            type="button"
            onClick={toggleLearned}
            className={[
              'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold outline-none focus-visible:ring-4 focus-visible:ring-emerald-200',
              isLearned
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            ].join(' ')}
          >
            {isLearned ? <Check size={17} aria-hidden="true" /> : <Star size={17} aria-hidden="true" />}
            {isLearned ? 'Đã học bảng này' : 'Đánh dấu đã học'}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}
      </section>

      <section className="rounded-[26px] border border-slate-100 bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-violet-600">Cùng đọc nhẩm nào!</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
              Bảng nhân {selectedTable}
            </h2>
          </div>
          <span className="text-3xl" aria-hidden="true">✨</span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((multiplier) => (
            <div
              key={multiplier}
              className="flex min-h-12 items-center justify-between rounded-xl bg-violet-50/70 px-4"
            >
              <span className="font-bold text-slate-600">
                {selectedTable} × {multiplier}
              </span>
              <span className="font-extrabold text-violet-700">
                {selectedTable * multiplier}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Phạm vi luyện tập</span>
            <select
              value={mixedPractice ? 'mixed' : 'selected'}
              onChange={(event) => setMixedPractice(event.target.value === 'mixed')}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="selected">Chỉ bảng nhân {selectedTable}</option>
              <option value="mixed">Ngẫu nhiên bảng 2–10</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Cách trả lời</span>
            <select
              value={answerMode}
              onChange={(event) => setAnswerMode(event.target.value as AnswerMode)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="choice">Chọn đáp án</option>
              <option value="input">Nhập kết quả</option>
            </select>
          </label>
          <Button
            onClick={startRandomPractice}
            variant="secondary"
          >
            <Dice5 size={18} aria-hidden="true" />
            Luyện ngẫu nhiên
          </Button>
        </div>
      </section>
    </div>
  )
}
