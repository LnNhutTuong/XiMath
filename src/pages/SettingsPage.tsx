import { useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, Check, Save, Settings2, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import type { ArithmeticOperator } from '../features/question-generator/types'
import {
  defaultLearningSettings,
  type LearningSettings,
} from '../services/learningStore'
import { useLearning } from '../services/useLearning'
import { useProfile } from '../profile/useProfile'
import { MAX_NAME_LENGTH } from '../profile/profileStore'

const operators: { value: ArithmeticOperator; label: string; emoji: string }[] = [
  { value: '+', label: 'Phép cộng', emoji: '🍎' },
  { value: '-', label: 'Phép trừ', emoji: '🎈' },
  { value: '×', label: 'Phép nhân', emoji: '⭐' },
  { value: '÷', label: 'Phép chia', emoji: '🍰' },
]

const selectClass =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'

function SettingField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export default function SettingsPage() {
  const { state, error, saveSettings, clearHistory } = useLearning()
  const { name, error: profileError, saveName } = useProfile()
  const [settings, setSettings] = useState<LearningSettings>(() => ({
    ...state.settings,
    operators: [...state.settings.operators],
  }))
  const [displayName, setDisplayName] = useState(name)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  function update<K extends keyof LearningSettings>(key: K, value: LearningSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function toggleOperator(operator: ArithmeticOperator) {
    const next = settings.operators.includes(operator)
      ? settings.operators.filter((value) => value !== operator)
      : [...settings.operators, operator]
    if (next.length === 0) {
      toast.error('Em hãy chọn ít nhất một phép tính nhé.')
      return
    }
    update('operators', next)
  }

  function save() {
    if (saveSettings(settings)) toast.success('Đã lưu cài đặt của em! ✨')
  }

  function saveDisplayName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saveName(displayName)) toast.success('Tên hiển thị đã được cập nhật! ✨')
  }

  function confirmClear() {
    if (clearHistory()) setShowClearConfirm(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-[26px] bg-gradient-to-br from-[#e4f7ec] to-[#eef3ff] p-6 sm:p-8">
        <span className="text-4xl" aria-hidden="true">🧸</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800">
          Cài đặt học tập
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Chọn cách học phù hợp với em. Mọi thay đổi chỉ lưu trên thiết bị này.
        </p>
      </header>

      <section className="rounded-[26px] border border-slate-100 bg-white p-5 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <UserRound size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-extrabold text-slate-800">Tên hiển thị</h2>
            <p className="mt-0.5 text-xs text-slate-400">Tên này sẽ dùng trong lời chào của em.</p>
          </div>
        </div>
        <form onSubmit={saveDisplayName} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <label htmlFor="settings-display-name" className="sr-only">
              Tên hiển thị
            </label>
            <input
              id="settings-display-name"
              autoComplete="given-name"
              minLength={2}
              maxLength={MAX_NAME_LENGTH}
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
            {profileError && (
              <p role="alert" className="mt-2 text-sm font-semibold text-rose-600">
                {profileError}
              </p>
            )}
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Dùng 2–{MAX_NAME_LENGTH} ký tự: chữ cái, dấu cách, dấu nháy hoặc gạch nối.
            </p>
          </div>
          <Button type="submit" variant="outline">
            <Save size={17} aria-hidden="true" />
            Đổi tên
          </Button>
        </form>
      </section>

      <section className="rounded-[26px] border border-slate-100 bg-white p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Settings2 size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-extrabold text-slate-800">Cấu hình bài tập</h2>
            <p className="mt-0.5 text-xs text-slate-400">Điều chỉnh theo nhịp học của em</p>
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-slate-700">Phép tính muốn luyện</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {operators.map(({ value, label, emoji }) => {
              const checked = settings.operators.includes(value)
              return (
                <label
                  key={value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 transition-colors ${
                    checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOperator(value)}
                    className="size-4 accent-emerald-600"
                  />
                  <span aria-hidden="true">{emoji}</span>
                  <span className="text-sm font-bold text-slate-700">{label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SettingField label="Số chữ số toán hạng thứ nhất">
            <select
              className={selectClass}
              value={settings.operandDigitsA}
              onChange={(event) => update('operandDigitsA', Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((digits) => (
                <option key={digits} value={digits}>{digits} chữ số</option>
              ))}
            </select>
          </SettingField>
          <SettingField label="Số chữ số toán hạng thứ hai">
            <select
              className={selectClass}
              value={settings.operandDigitsB}
              onChange={(event) => update('operandDigitsB', Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((digits) => (
                <option key={digits} value={digits}>{digits} chữ số</option>
              ))}
            </select>
          </SettingField>
          <SettingField label="Giới hạn kết quả tối đa">
            <input
              type="number"
              min={0}
              max={999_999}
              value={settings.maxResult}
              onChange={(event) => update('maxResult', Number(event.target.value))}
              className={selectClass}
            />
          </SettingField>
          <SettingField label="Số câu hỏi mỗi lượt">
            <select
              className={selectClass}
              value={settings.questionCount}
              onChange={(event) => update('questionCount', Number(event.target.value))}
            >
              {[5, 10, 15, 20, 30, 50, 100].map((count) => (
                <option key={count} value={count}>{count} câu</option>
              ))}
            </select>
          </SettingField>
          <SettingField label="Độ khó mặc định">
            <select
              className={selectClass}
              value={settings.difficulty}
              onChange={(event) =>
                update('difficulty', event.target.value as LearningSettings['difficulty'])
              }
            >
              <option value="warmup">Khởi động</option>
              <option value="practice">Luyện tập</option>
              <option value="challenge">Thử thách</option>
            </select>
          </SettingField>
          <SettingField label="Cách trả lời">
            <select
              className={selectClass}
              value={settings.answerMode}
              onChange={(event) =>
                update('answerMode', event.target.value as LearningSettings['answerMode'])
              }
            >
              <option value="choice">Chọn đáp án</option>
              <option value="input">Nhập kết quả</option>
            </select>
          </SettingField>
        </div>

        <div className="mt-5 space-y-3">
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={settings.allowNegative}
              onChange={(event) => update('allowNegative', event.target.checked)}
              className="size-4 accent-emerald-600"
            />
            Cho phép phép trừ có kết quả âm
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={settings.showAnswersImmediately}
              onChange={(event) => update('showAnswersImmediately', event.target.checked)}
              className="size-4 accent-emerald-600"
            />
            Hiện phản hồi và đáp án khi luyện tập
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}
        <Button onClick={save} size="lg" className="mt-6">
          <Save size={18} aria-hidden="true" />
          Lưu cài đặt
        </Button>
      </section>

      <section className="rounded-[26px] border border-rose-100 bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-slate-800">Lịch sử học tập</h2>
            <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
              Xóa các lượt luyện và bảng nhân đã đánh dấu. Cài đặt của em sẽ được giữ lại.
            </p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-500">
            <Trash2 size={19} aria-hidden="true" />
          </span>
        </div>
        {!showClearConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(true)}
            className="mt-5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 size={17} aria-hidden="true" />
            Xóa lịch sử học tập
          </Button>
        ) : (
          <div className="mt-5 rounded-2xl bg-rose-50 p-4">
            <p className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle size={18} aria-hidden="true" />
              Em chắc chắn muốn xóa chứ?
            </p>
            <p className="mt-1 text-sm leading-5 text-rose-700">
              Lịch sử lượt học và các bảng đã đánh dấu sẽ bị xóa khỏi thiết bị này.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="destructive" onClick={confirmClear}>
                <Trash2 size={16} aria-hidden="true" />
                Xóa hẳn
              </Button>
              <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                <Check size={16} aria-hidden="true" />
                Giữ lại
              </Button>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => setSettings({
            ...defaultLearningSettings,
            operators: [...defaultLearningSettings.operators],
          })}
        >
          Khôi phục cấu hình mặc định
        </Button>
      </section>
    </div>
  )
}
