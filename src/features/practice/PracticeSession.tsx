import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Send, Star } from 'lucide-react'
import type { Question } from '../question-generator/types'

export type AnswerMode = 'choice' | 'input'
export type PracticeMode = 'practice' | 'test'

type PracticeSessionProps = {
  questions: Question[]
  answerMode: AnswerMode
  practiceMode: PracticeMode
  onRestart: () => void
}

function createChoices(answer: number): number[] {
  const choices = new Set<number>([answer])
  for (let offset = 1; choices.size < 4; offset += 1) {
    choices.add(answer + offset)
    if (answer - offset >= 0) choices.add(answer - offset)
  }
  return [...choices].sort(() => Math.random() - 0.5)
}

export default function PracticeSession({
  questions,
  answerMode,
  practiceMode,
  onRestart,
}: PracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [inputValue, setInputValue] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState('')
  const question = questions[currentIndex]
  const response = answers[question.id]
  const isPractice = practiceMode === 'practice'
  const correctCount = questions.reduce(
    (count, item) => count + (answers[item.id] === item.answer ? 1 : 0),
    0,
  )
  const answeredCount = Object.keys(answers).length
  const percent = Math.round(((currentIndex + 1) / questions.length) * 100)

  function saveAnswer(value: number) {
    setAnswers((current) => ({ ...current, [question.id]: value }))
    setError('')
  }

  function submitInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const answer = Number(inputValue)
    if (!inputValue.trim() || !Number.isSafeInteger(answer)) {
      setError('Em hãy nhập một số nguyên nhé.')
      return
    }
    saveAnswer(answer)
    setInputValue('')
  }

  function moveTo(index: number) {
    setCurrentIndex(index)
    setInputValue('')
    setError('')
  }

  if (isComplete) {
    const unansweredCount = questions.length - answeredCount
    return (
      <section className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-9">
        <div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-amber-50 text-amber-500">
          <Star size={32} fill="currentColor" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-center text-2xl font-extrabold text-slate-800">
          Em đã hoàn thành rồi! 🎉
        </h2>
        <p className="mt-2 text-center text-slate-500">
          Mỗi lần luyện tập, em lại tiến bộ hơn một chút.
        </p>
        <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-5">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-slate-800">{questions.length}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">Tổng số câu</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{correctCount}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">Câu đúng</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-rose-500">
              {questions.length - correctCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">Chưa đúng</p>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-500">
          {unansweredCount > 0
            ? `${unansweredCount} câu chưa trả lời được tính là chưa đúng.`
            : `${Math.round((correctCount / questions.length) * 100)}% câu trả lời chính xác.`}
        </p>
        <div className="mx-auto mt-7 max-w-2xl space-y-2">
          {questions.map((item, index) => {
            const answer = answers[item.id]
            const isCorrect = answer === item.answer
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 px-4 py-3 text-sm"
              >
                <span className="font-bold text-slate-700">
                  {index + 1}. {item.operandA} {item.operator} {item.operandB}
                </span>
                <span className="text-slate-500">
                  {answer === undefined ? 'Chưa trả lời' : `Em trả lời: ${answer}`}
                  {!isCorrect && ` · Đáp án: ${item.answer}`}
                </span>
                <span className={isCorrect ? 'font-bold text-emerald-600' : 'font-bold text-rose-500'}>
                  {isCorrect ? 'Đúng' : 'Cùng thử lại nhé'}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-5 font-bold text-white outline-none hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Tạo bài mới
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">
          Câu {currentIndex + 1} / {questions.length}
        </p>
        <p className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
          {isPractice ? 'Luyện tập' : 'Kiểm tra'} ·{' '}
          {answerMode === 'choice' ? 'Chọn đáp án' : 'Nhập kết quả'}
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Tiến độ bài tập"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={currentIndex + 1}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="py-10 text-center sm:py-12">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Tính nhẩm nhé!
        </p>
        <p className="mt-4 text-5xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
          {question.operandA} <span className="text-emerald-600">{question.operator}</span>{' '}
          {question.operandB} <span className="text-slate-300">=</span> ?
        </p>
      </div>

      {answerMode === 'choice' ? (
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
          {createChoices(question.answer).map((choice) => {
            const selected = response === choice
            const correct = isPractice && selected && choice === question.answer
            const incorrect = isPractice && selected && choice !== question.answer
            return (
              <button
                key={choice}
                type="button"
                onClick={() => saveAnswer(choice)}
                aria-pressed={selected}
                className={[
                  'min-h-[60px] rounded-2xl border-2 text-xl font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-emerald-200',
                  correct
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : incorrect
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : selected
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50',
                ].join(' ')}
              >
                {choice}
              </button>
            )
          })}
        </div>
      ) : (
        <form onSubmit={submitInput} className="mx-auto flex max-w-sm gap-2">
          <label className="sr-only" htmlFor="answer-input">
            Nhập đáp án
          </label>
          <input
            id="answer-input"
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Đáp án của em"
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-lg font-bold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="submit"
            className="grid min-h-12 min-w-12 place-items-center rounded-2xl bg-emerald-600 text-white outline-none hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
            aria-label="Lưu câu trả lời"
          >
            <Send size={19} aria-hidden="true" />
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-rose-600">
          {error}
        </p>
      )}
      {isPractice && response !== undefined && (
        <p
          role="status"
          className={`mt-4 flex items-center justify-center gap-2 text-sm font-bold ${
            response === question.answer ? 'text-emerald-600' : 'text-rose-500'
          }`}
        >
          {response === question.answer ? (
            <>
              <CheckCircle2 size={18} aria-hidden="true" />
              Chính xác! Em giỏi lắm! ⭐
            </>
          ) : (
            'Chưa đúng rồi, em thử lại nhé!'
          )}
        </p>
      )}
      {isPractice && answerMode === 'input' && response !== undefined && response !== question.answer && (
        <p className="mt-2 text-center text-sm text-slate-500">
          Gợi ý: đáp án đúng là {question.answer}.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => moveTo(currentIndex - 1)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-bold text-slate-500 outline-none hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Câu trước
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Đã trả lời {answeredCount}/{questions.length}
        </span>
        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => moveTo(currentIndex + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white outline-none hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            Câu tiếp theo
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsComplete(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white outline-none hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            Nộp bài
            <CheckCircle2 size={17} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
