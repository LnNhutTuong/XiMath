import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import PracticeSession, {
  type AnswerMode,
} from '../features/practice/PracticeSession'
import type { ArithmeticOperator, Question } from '../features/question-generator/types'
import { useProfile } from '../profile/useProfile'
import { useLearning } from '../services/useLearning'
import {
  answersToRecord,
  createDailyPracticeRecord,
  generateDailyQuestions,
  getDailyStudyDate,
  validateDailyConfig,
} from '../services/dailyPractice'
import type {
  AttemptAnswer,
  DailyPracticeConfig,
  DailyQuestionCounts,
} from '../services/learningStore'

const operatorChoices: { operator: ArithmeticOperator; label: string }[] = [
  { operator: '+', label: 'Cộng +' },
  { operator: '-', label: 'Trừ −' },
  { operator: '×', label: 'Nhân ×' },
  { operator: '÷', label: 'Chia ÷' },
]

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
})

function countCorrect(answers: AttemptAnswer[]) {
  return answers.reduce(
    (count, entry) => count + (entry.answer === entry.question.answer ? 1 : 0),
    0,
  )
}

export default function DailyPracticePage() {
  const {
    state,
    error: storageError,
    ensureDailyPractice,
    replaceDailyPractice,
    saveDailyProgress,
    completeDailyPractice,
    recordAttempt,
    saveDailyConfig,
  } = useLearning()
  const { name } = useProfile()
  const [studyDate, setStudyDate] = useState(() => getDailyStudyDate())
  const [startedDate, setStartedDate] = useState(() => {
    const today = getDailyStudyDate()
    const saved = state.dailySessions.find((session) => session.studyDate === today)
    return saved &&
      (saved.currentIndex > 0 || saved.answers.some((entry) => entry.answer !== null))
      ? today
      : ''
  })
  const [config, setConfig] = useState<DailyPracticeConfig>(() => {
    const saved = state.dailySessions.find(
      (session) => session.studyDate === getDailyStudyDate(),
    )?.config
    const preferred = saved ?? state.dailyConfig
    return {
      operators: [...preferred.operators],
      questionCounts: { ...preferred.questionCounts },
    }
  })
  const [retryQuestions, setRetryQuestions] = useState<Question[] | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [error, setError] = useState('')

  const dailyRecord = state.dailySessions.find((session) => session.studyDate === studyDate)
  const isPreparing = !dailyRecord && !storageError
  const configError = validateDailyConfig(config)
  const isCompleted = dailyRecord?.completedAt !== null && dailyRecord !== undefined
  const hasStarted =
    dailyRecord !== undefined &&
    (dailyRecord.currentIndex > 0 ||
      dailyRecord.answers.some((entry) => entry.answer !== null))
  const answerMode: AnswerMode = state.settings.answerMode

  useEffect(() => {
    function refreshStudyDate() {
      const currentDate = getDailyStudyDate()
      if (studyDate === currentDate) return
      setStudyDate(currentDate)
      const saved = state.dailySessions.find((session) => session.studyDate === currentDate)
      setConfig(saved
        ? { operators: [...saved.config.operators], questionCounts: { ...saved.config.questionCounts } }
        : {
            operators: [...state.dailyConfig.operators],
            questionCounts: { ...state.dailyConfig.questionCounts },
          })
      setRetryQuestions(null)
      setStartedDate(
        saved &&
          (saved.currentIndex > 0 || saved.answers.some((entry) => entry.answer !== null))
          ? currentDate
          : '',
      )
      setError('')
    }

    window.addEventListener('focus', refreshStudyDate)
    document.addEventListener('visibilitychange', refreshStudyDate)
    return () => {
      window.removeEventListener('focus', refreshStudyDate)
      document.removeEventListener('visibilitychange', refreshStudyDate)
    }
  }, [state.dailyConfig, state.dailySessions, studyDate])

  useEffect(() => {
    if (dailyRecord) return
    try {
      const created = createDailyPracticeRecord(studyDate, state.dailyConfig)
      ensureDailyPractice(created)
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Chưa tạo được bài hôm nay. Em hãy thử lại nhé.',
      )
    }
  }, [dailyRecord, ensureDailyPractice, state.dailyConfig, studyDate])

  const totalQuestions = useMemo(
    () =>
      config.questionCounts.warmup +
      config.questionCounts.practice +
      config.questionCounts.challenge,
    [config.questionCounts],
  )

  function updateCount(level: keyof DailyQuestionCounts, value: number) {
    setConfig((current) => ({
      ...current,
      questionCounts: {
        ...current.questionCounts,
        [level]: Number.isFinite(value) ? Math.min(30, Math.max(0, Math.trunc(value))) : 0,
      },
    }))
  }

  function toggleOperator(operator: ArithmeticOperator) {
    setConfig((current) => {
      const operators = current.operators.includes(operator)
        ? current.operators.filter((value) => value !== operator)
        : [...current.operators, operator]
      return { ...current, operators }
    })
  }

  function applyConfig() {
    if (configError) {
      setError(configError)
      return
    }
    const sameConfig =
      dailyRecord &&
      dailyRecord.config.operators.length === config.operators.length &&
      dailyRecord.config.operators.every((operator, index) => operator === config.operators[index]) &&
      dailyRecord.config.questionCounts.warmup === config.questionCounts.warmup &&
      dailyRecord.config.questionCounts.practice === config.questionCounts.practice &&
      dailyRecord.config.questionCounts.challenge === config.questionCounts.challenge
    if (sameConfig) {
      if (!saveDailyConfig(config)) {
        setError('Chưa lưu được tùy chỉnh. Em hãy thử lại nhé.')
        return
      }
      setStartedDate(studyDate)
      setError('')
      return
    }
    try {
      const nextRecord = createDailyPracticeRecord(studyDate, config)
      if (replaceDailyPractice(nextRecord)) {
        setStartedDate(studyDate)
        setError('')
      } else {
        setError('Bài hôm nay đã có tiến độ nên chưa thể đổi bộ đề.')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chưa tạo được bộ đề.')
    }
  }

  function startRetry() {
    if (!dailyRecord) return
    try {
      const questions = generateDailyQuestions(dailyRecord.config)
      setRetryQuestions(questions)
      setRetryKey((current) => current + 1)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chưa tạo được lượt luyện lại.')
    }
  }

  function completeRetry(questions: Question[], answers: Record<string, number>) {
    if (!recordAttempt('daily-retry', questions, answers)) {
      setError('Chưa lưu được lượt luyện lại. Em có thể tiếp tục xem kết quả trên màn hình.')
    }
  }

  const savedAnswers = dailyRecord ? answersToRecord(dailyRecord.answers) : {}

  if (retryQuestions) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-violet-700">🔁 Lượt luyện thêm · Không đổi kết quả chính</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800">Luyện lại bài hôm nay</h1>
          </div>
          <Button variant="outline" onClick={() => setRetryQuestions(null)}>
            Xem kết quả chính
          </Button>
        </div>
        <PracticeSession
          key={retryKey}
          questions={retryQuestions}
          answerMode={answerMode}
          practiceMode="practice"
          showFeedback={state.settings.showAnswersImmediately}
          onRestart={startRetry}
          onComplete={completeRetry}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#dcf6e8] via-[#eaf8ef] to-[#e6f1ff] p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-sm font-bold text-emerald-700">
          <CalendarDays size={16} aria-hidden="true" />
          {dateFormatter.format(new Date(`${studyDate}T12:00:00+07:00`))}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">
          Bài tập mỗi ngày
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          {name ? `Chào ${name}! ` : ''}30 câu hỏi nhỏ, một hành trình thật vui. Tiến độ được lưu tự động trên thiết bị này.
        </p>
        <span className="pointer-events-none absolute -right-2 bottom-0 hidden text-7xl opacity-70 sm:block" aria-hidden="true">
          🐰✨
        </span>
      </header>

      {isPreparing && !dailyRecord ? (
        <section
          role="status"
          className="flex min-h-56 items-center justify-center gap-3 rounded-[26px] border border-slate-100 bg-white p-8 text-center font-bold text-slate-500"
        >
          <span className="size-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 motion-reduce:animate-none" />
          Đang chuẩn bị 30 câu hỏi cho em…
        </section>
      ) : error && !dailyRecord ? (
        <section className="rounded-[26px] border border-rose-100 bg-white p-6">
          <p role="alert" className="flex items-center gap-2 font-semibold text-rose-700">
            <AlertCircle size={19} aria-hidden="true" />
            {error}
          </p>
          <Button className="mt-4" onClick={() => setStudyDate(getDailyStudyDate())}>
            Thử lại
          </Button>
        </section>
      ) : dailyRecord && isCompleted ? (
        <section className="rounded-[28px] border border-slate-100 bg-white p-5 sm:p-8">
          <div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-amber-50 text-amber-500">
            <Star size={32} fill="currentColor" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-center text-2xl font-extrabold text-slate-800">
            Em đã hoàn thành bài hôm nay! 🎉
          </h2>
          <p className="mt-2 text-center text-slate-500">
            Kết quả chính thức đã được lưu. Luyện lại sẽ không thay đổi kết quả này.
          </p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-5">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-slate-800">30</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Tổng số câu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-emerald-600">{countCorrect(dailyRecord.answers)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Câu đúng</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-rose-500">
                {30 - countCorrect(dailyRecord.answers)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Cần luyện thêm</p>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-slate-500">
            {Math.round((countCorrect(dailyRecord.answers) / 30) * 100)}% chính xác
          </p>
          <div className="mx-auto mt-6 max-w-2xl space-y-2">
            {dailyRecord.answers.map(({ question, answer }, index) => (
              <div
                key={question.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-4 py-3 text-sm"
              >
                <span className="font-bold text-slate-700">
                  {index + 1}. {question.operandA} {question.operator} {question.operandB}
                </span>
                <span className="text-slate-500">
                  {answer === null ? 'Chưa trả lời' : `Em trả lời: ${answer}`}
                  {answer !== question.answer && ` · Đáp án đúng: ${question.answer}`}
                </span>
                {answer === question.answer && (
                  <CheckCircle2 size={17} className="text-emerald-600" aria-label="Trả lời đúng" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={startRetry}>
              <RotateCcw size={18} aria-hidden="true" />
              Luyện lại (không đổi điểm chính)
            </Button>
          </div>
        </section>
      ) : dailyRecord ? (
        <>
          {!hasStarted && startedDate !== studyDate && (
            <section className="rounded-[26px] border border-slate-100 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Sparkles size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-800">Bộ đề 30 câu</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Chọn tỷ lệ câu hỏi và phép tính trước khi bắt đầu.
                  </p>
                </div>
              </div>
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-bold text-slate-700">Phép tính</legend>
                <div className="flex flex-wrap gap-2">
                  {operatorChoices.map(({ operator, label }) => (
                    <label
                      key={operator}
                      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold ${
                        config.operators.includes(operator)
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={config.operators.includes(operator)}
                        onChange={() => toggleOperator(operator)}
                        className="size-4 accent-emerald-600"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {([
                  ['warmup', 'Khởi động'],
                  ['practice', 'Luyện tập'],
                  ['challenge', 'Thử thách'],
                ] as const).map(([level, label]) => (
                  <label key={level} className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      step={1}
                      value={config.questionCounts[level]}
                      onChange={(event) => updateCount(level, Number(event.target.value))}
                      className="min-h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                ))}
              </div>
              <p
                className={`mt-3 text-sm font-semibold ${
                  totalQuestions === 30 ? 'text-slate-400' : 'text-rose-600'
                }`}
              >
                Tổng: {totalQuestions}/30 câu
              </p>
              {configError && (
                <p role="alert" className="mt-2 text-sm font-semibold text-rose-600">
                  {configError}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-2 text-sm font-semibold text-rose-600">
                  {error}
                </p>
              )}
              <Button size="lg" className="mt-5" onClick={applyConfig} disabled={Boolean(configError)}>
                Bắt đầu bài hôm nay
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </section>
          )}
          {hasStarted && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <span>
                Tiến độ đã lưu: {dailyRecord.answers.filter(({ answer }) => answer !== null).length}/30 câu.
                Em có thể rời trang rồi quay lại sau.
              </span>
              <span className="text-xs text-emerald-700">
                {dailyRecord.config.operators.join(' · ')}
              </span>
            </div>
          )}
          {(hasStarted || startedDate === studyDate) && (
            <PracticeSession
              key={dailyRecord.id}
              questions={dailyRecord.questions}
              answerMode={answerMode}
              practiceMode={state.settings.showAnswersImmediately ? 'practice' : 'test'}
              showFeedback={state.settings.showAnswersImmediately}
              initialIndex={dailyRecord.currentIndex}
              initialAnswers={savedAnswers}
              onProgress={(currentIndex, answers) =>
                saveDailyProgress(studyDate, currentIndex, answers)
              }
              onRestart={startRetry}
              onComplete={(_questions, answers) =>
                completeDailyPractice(studyDate, answers)
              }
            />
          )}
        </>
      ) : null}
    </div>
  )
}
