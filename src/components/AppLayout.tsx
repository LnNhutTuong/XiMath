import { NavLink, Outlet } from "react-router-dom";
import { navigationItems } from "../data/navigation";

function Brand() {
  return (
    <NavLink
      to="/"
      aria-label="Bé Vui Học Toán - về trang chủ"
      className="flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-2xl">
        🐻
      </span>
      <span className="leading-tight">
        <span className="block text-[22px] font-extrabold tracking-tight text-slate-800">
          XiMath
        </span>
        <span className="mt-1 block text-xs font-medium text-slate-400">
          I love At00
        </span>
      </span>
    </NavLink>
  );
}

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label={
        mobile ? "Điều hướng chính trên điện thoại" : "Điều hướng chính"
      }
      className={mobile ? "flex gap-2 overflow-x-auto px-4 pb-3" : "space-y-1"}
    >
      {navigationItems.map(({ icon: Icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            [
              "flex shrink-0 items-center gap-3 rounded-2xl font-semibold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-emerald-200",
              mobile ? "px-4 py-2.5 text-sm" : "px-4 py-3 text-[15px]",
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
            ].join(" ")
          }
        >
          <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[264px] flex-col border-r border-slate-100 bg-white px-5 py-7 lg:flex">
        <Brand />
        <p className="mb-3 mt-11 px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-300">
          Góc học tập
        </p>
        <Navigation />
        <div className="mt-auto rounded-[24px] bg-[#fff8e8] p-4">
          <div className="mb-2 text-2xl" aria-hidden="true">
            🌈
          </div>
          <p className="text-sm font-bold text-slate-700">
            Em học thật vui nhé!
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Mỗi phép tính nhỏ là một bước tiến lớn.
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur lg:hidden">
          <div className="px-4 pb-3 pt-4">
            <Brand />
          </div>
          <Navigation mobile />
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
