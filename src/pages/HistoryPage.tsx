import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarDays, Clock3, Sparkles } from 'lucide-react'
import { useLearning } from '../services/useLearning'

const dateTimeFormat = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
})

const categoryLabels = {
  addition: 'Phép cộng',
  subtraction: 'Phép trừ',
  multiplication: 'Phép nhân',
  division: 'Phép chia',
  tables: 'Bảng cửu chương',
  daily: 'Bài tập mỗi ngày',
  'daily-retry': 'Luyện lại bài mỗi ngày',
}

export default function HistoryPage() {
  const { state } = useLearning()
  const attempts = state.attempts

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-[26px] bg-gradient-to-br from-[#fff3e5] to-[#fff8e8] p-6 sm:p-8">
        <span className="text-4xl" aria-hidden="true">📖</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800">
          Nhật ký học tập
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Cùng nhìn lại những điều em đã chinh phục nhé!
        </p>
      </header>

      {attempts.length === 0 ? (
        <section className="flex min-h-[320px] flex-col items-center justify-center rounded-[26px] border border-slate-100 bg-white px-6 py-10 text-center">
          <span className="grid size-16 place-items-center rounded-[22px] bg-amber-50 text-amber-500">
            <BookOpen size={30} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-slate-800">Nhật ký còn trống</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Hoàn thành một bài luyện tập để lưu lại thành tích đầu tiên của em.
          </p>
          <Link
            to="/addition"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-emerald-600 px-4 font-bold text-white shadow-[0_4px_0_#16804a] outline-none transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200 active:translate-y-0"
          >
            Bắt đầu luyện tập
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {attempts.map((attempt) => {
            const accuracy = Math.round((attempt.correctCount / attempt.questionCount) * 100)
            return (
              <article
                key={attempt.id}
                className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                      <Sparkles size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-extrabold text-slate-800">
                        {categoryLabels[attempt.category]}
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} aria-hidden="true" />
                          {attempt.studyDate}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={13} aria-hidden="true" />
                          {dateTimeFormat.format(new Date(attempt.completedAt))}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${
                      accuracy >= 80
                        ? 'bg-emerald-50 text-emerald-700'
                        : accuracy >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-sky-50 text-sky-700'
                    }`}
                  >
                    {accuracy}% chính xác
                  </span>
                </div>
                <div className="mt-4 flex gap-5 border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">{attempt.questionCount} câu</span>
                  <span className="font-bold text-emerald-600">{attempt.correctCount} câu đúng</span>
                  <span className="font-bold text-rose-500">
                    {attempt.questionCount - attempt.correctCount} câu cần luyện thêm
                  </span>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer rounded-lg py-2 text-sm font-bold text-emerald-700 outline-none hover:text-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-200">
                    Xem lại câu trả lời
                  </summary>
                  <div className="mt-2 space-y-2">
                    {attempt.answers.map(({ question, answer }, index) => {
                      const correct = answer === question.answer
                      return (
                        <p
                          key={question.id}
                          className={`rounded-xl px-3 py-2 text-sm ${
                            correct ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          Câu {index + 1}: {question.operandA} {question.operator}{' '}
                          {question.operandB} = {question.answer}
                          {' · '}
                          {answer === null ? 'Chưa trả lời' : `Em trả lời ${answer}`}
                        </p>
                      )
                    })}
                  </div>
                </details>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
