import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { navigationItems } from '../data/navigation'

export default function ComingSoonPage() {
  const { pathname } = useLocation()
  const currentPage = navigationItems.find((item) => item.to === pathname)

  return (
    <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-[28px] border border-slate-100 bg-white px-6 py-12 text-center sm:px-10">
      <span className="grid size-16 place-items-center rounded-[22px] bg-emerald-50 text-emerald-600">
        <Sparkles size={28} aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-bold text-emerald-700">Góc học tập</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
        {currentPage?.label ?? 'Trang chưa tìm thấy'}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
        {currentPage
          ? 'Góc học này đang được chuẩn bị thật vui. Con có thể quay lại trang chủ để chọn bài học khác nhé!'
          : 'Mình chưa tìm thấy trang này. Cùng quay về trang chủ nhé!'}
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-5 font-bold text-white outline-none transition hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Về trang chủ
      </Link>
    </section>
  )
}
