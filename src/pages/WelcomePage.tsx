import { useState, type FormEvent } from 'react'
import { useProfile } from '../profile/useProfile'

export default function WelcomePage() {
  const { error, saveName } = useProfile()
  const [name, setName] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveName(name)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#e5f8ec] via-[#f7f8fc] to-[#eaf3ff] px-4 py-8">
      <section className="w-full max-w-md rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_55px_rgba(51,78,115,0.09)] sm:p-9">
        <div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-emerald-100 text-4xl" aria-hidden="true">
          🐻
        </div>
        <p className="mt-6 text-center text-sm font-extrabold text-emerald-700">
          Chào mừng em đến với
        </p>
        <h1 className="mt-1 text-center text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          Bé Vui Học Toán
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-500">
          Em muốn chúng mình gọi em là gì nhỉ?
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-700" htmlFor="learner-name">
            Tên em muốn dùng
          </label>
          <input
            id="learner-name"
            autoComplete="given-name"
            autoFocus
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ví dụ: Minh Anh"
            required
            value={name}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
          {error && (
            <p role="alert" className="text-sm font-medium leading-5 text-rose-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="min-h-12 w-full rounded-2xl bg-emerald-600 px-5 font-extrabold text-white outline-none transition hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            Bắt đầu học thôi! ✨
          </button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Tên chỉ được lưu trên thiết bị này để chào em thân thiện hơn.
        </p>
      </section>
    </main>
  )
}
