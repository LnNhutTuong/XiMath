import {
  ArrowRight,
  Award,
  CalendarDays,
  Calculator,
  Check,
  ChevronRight,
  Flame,
  Plus,
  Settings2,
  Sparkles,
  Table2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../profile/useProfile'
import { useLearning } from '../services/useLearning'

type PracticeCard = {
  title: string
  subtitle: string
  to: string
  icon: LucideIcon
  emoji: string
  style: string
  iconStyle: string
}

const practiceCards: PracticeCard[] = [
  {
    title: 'Phép cộng',
    subtitle: 'Cùng gom những con số',
    to: '/addition',
    icon: Plus,
    emoji: '🍎',
    style: 'bg-[#effaf4] hover:bg-[#e8f7ee]',
    iconStyle: 'bg-[#d8f3e3] text-[#3d9a68]',
  },
  {
    title: 'Phép trừ',
    subtitle: 'Tập đếm lùi thật nhanh',
    to: '/subtraction',
    icon: TrendingUp,
    emoji: '🎈',
    style: 'bg-[#fff5eb] hover:bg-[#fff0e1]',
    iconStyle: 'bg-[#ffe5ca] text-[#e79245]',
  },
  {
    title: 'Phép nhân',
    subtitle: 'Khám phá nhóm bằng nhau',
    to: '/multiplication',
    icon: Sparkles,
    emoji: '⭐',
    style: 'bg-[#f2efff] hover:bg-[#ece8ff]',
    iconStyle: 'bg-[#e1dcff] text-[#806bdd]',
  },
  {
    title: 'Phép chia',
    subtitle: 'Chia đều thành từng nhóm',
    to: '/division',
    icon: Calculator,
    emoji: '🍰',
    style: 'bg-[#fff0f3] hover:bg-[#ffe8ed]',
    iconStyle: 'bg-[#ffdee6] text-[#dd6b87]',
  },
  {
    title: 'Bảng cửu chương',
    subtitle: 'Học thuộc lòng dễ dàng',
    to: '/tables',
    icon: Table2,
    emoji: '📚',
    style: 'bg-[#edf6ff] hover:bg-[#e4f1ff]',
    iconStyle: 'bg-[#d9ebff] text-[#538ad1]',
  },
]

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Asia/Ho_Chi_Minh',
})

export default function HomePage() {
  const [now] = useState(() => new Date())
  const { name } = useProfile()
  const { state, streak } = useLearning()
  const completedAttempts = state.attempts.length
  const totalQuestions = state.attempts.reduce((sum, attempt) => sum + attempt.questionCount, 0)
  const totalCorrect = state.attempts.reduce((sum, attempt) => sum + attempt.correctCount, 0)
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const hasPerfectAttempt = state.attempts.some(
    (attempt) => attempt.correctCount === attempt.questionCount,
  )
  const today = dateFormatter.format(now)
  const capitalizedDate = today.charAt(0).toLocaleUpperCase('vi-VN') + today.slice(1)

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <CalendarDays size={16} aria-hidden="true" />
            {capitalizedDate}
          </p>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            Chào em, {name}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Hôm nay mình cùng học thêm điều mới nhé.
          </p>
        </div>
        <Link
          to="/settings"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 outline-none transition hover:border-emerald-200 hover:text-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          <Settings2 size={17} aria-hidden="true" />
          Cài đặt
        </Link>
      </section>

      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#dcf6e8] via-[#eaf8ef] to-[#e6f1ff] px-6 py-7 sm:px-9 sm:py-9">
        <div className="relative z-[1] max-w-[540px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-extrabold text-emerald-700 sm:text-sm">
            <Sparkles size={15} aria-hidden="true" />
            Mỗi ngày một chút, giỏi hơn thật nhiều!
          </span>
          <h2 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-[40px]">
            Sẵn sàng chinh phục thử thách hôm nay?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            30 câu đố vui đang chờ em khám phá. Cùng bắt đầu nào!
          </p>
          <Link
            to="/daily"
            className="mt-6 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#35a66b] px-6 text-base font-extrabold text-white shadow-[0_8px_18px_rgba(53,166,107,0.2)] outline-none transition hover:bg-[#2e965f] focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            Bắt đầu học
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div
          className="pointer-events-none absolute -right-5 -top-5 hidden size-[310px] place-items-center rounded-full bg-white/45 text-[150px] sm:grid lg:right-10 lg:top-1/2 lg:-translate-y-1/2"
          aria-hidden="true"
        >
            <img src="../../public/Usagi.ico" alt="Usagi" />
          <span className="absolute right-1 top-12 rotate-12 text-4xl">✨</span>
          <span className="absolute bottom-12 left-3 -rotate-12 text-4xl">🌟</span>
        </div>
        <span
          className="pointer-events-none absolute -bottom-16 right-12 text-8xl opacity-20 sm:hidden"
          aria-hidden="true"
        >
          🦊
        </span>
      </section>

      <section aria-labelledby="practice-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="practice-heading" className="text-xl font-extrabold text-slate-800">
              Chọn điều em muốn học
            </h2>
            <p className="mt-1 text-sm text-slate-400">Chạm vào một thẻ để bắt đầu nhé!</p>
          </div>
          <Link
            to="/daily"
            className="hidden items-center gap-1 text-sm font-bold text-emerald-700 outline-none hover:text-emerald-800 focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-emerald-200 sm:inline-flex"
          >
            Bài hôm nay <ChevronRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {practiceCards.map(({ title, subtitle, to, icon: Icon, emoji, style, iconStyle }) => (
            <Link
              key={to}
              to={to}
              className={`group flex min-h-[156px] flex-col justify-between rounded-[24px] p-5 outline-none transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:ring-4 focus-visible:ring-emerald-200 ${style}`}
            >
              <div className="flex items-start justify-between">
                <span className={`grid size-11 place-items-center rounded-2xl ${iconStyle}`}>
                  <Icon size={21} strokeWidth={2.4} aria-hidden="true" />
                </span>
                <span className="text-2xl" aria-hidden="true">
                  {emoji}
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-2">
                <span>
                  <span className="block font-extrabold text-slate-800">{title}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">{subtitle}</span>
                </span>
                <ArrowRight
                  size={18}
                  className="mb-0.5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800">Tiến độ học tập</h2>
              <p className="mt-1 text-sm text-slate-400">Hành trình của em</p>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-[#edf6ff] text-[#5790d2]">
              <TrendingUp size={20} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100">
            <div className="px-2 text-center">
              <p className="text-2xl font-extrabold text-slate-800">{completedAttempts}</p>
              <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">Bài đã làm</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-2xl font-extrabold text-slate-800">{accuracy}%</p>
              <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">Trả lời đúng</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-2xl font-extrabold text-slate-800">{streak}</p>
              <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">Ngày liên tiếp</p>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500">
            {completedAttempts
              ? `Em đã hoàn thành ${totalQuestions} câu hỏi. Tiếp tục phát huy nhé! 🌱`
              : 'Làm bài đầu tiên để bắt đầu hành trình nhé! 🌱'}
          </p>
          <Link
            to="/history"
            className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-bold text-emerald-700 outline-none hover:bg-emerald-50 focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            Xem nhật ký học tập <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-[24px] border border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800">Thành tích của em</h2>
              <p className="mt-1 text-sm text-slate-400">Những chiếc huy hiệu đáng yêu</p>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-[#fff5df] text-[#e5a93a]">
              <Award size={20} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-5 flex min-h-[94px] items-center gap-4 rounded-2xl bg-[#fffaf0] px-4">
            <span className="text-3xl" aria-hidden="true">
              🏅
            </span>
            <p className="text-sm leading-6 text-slate-500">
              {hasPerfectAttempt
                ? 'Huy hiệu Ngôi sao chăm chỉ đã được mở khóa! Cố lên nhé!'
                : 'Huy hiệu đầu tiên đang chờ em. Cố lên nhé!'}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Flame size={16} className="text-orange-400" aria-hidden="true" />
            <span>{streak ? `Em đang học liên tiếp ${streak} ngày` : 'Chuỗi học tập sẽ bắt đầu sau bài đầu tiên'}</span>
            <Check size={15} className="ml-auto text-slate-300" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  )
}
