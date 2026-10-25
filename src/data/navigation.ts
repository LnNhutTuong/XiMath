import {
  BookOpen,
  CalendarDays,
  Calculator,
  Home,
  Lightbulb,
  History,
  Settings,
  Sparkles,
  Table2,
  type LucideIcon,
} from 'lucide-react'

export type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  section?: string
}

export const navigationItems: NavigationItem[] = [
  { label: 'Trang chủ', to: '/', icon: Home },
  { label: 'Bài tập hôm nay', to: '/daily', icon: CalendarDays },
  { label: 'Phép cộng', to: '/addition', icon: Sparkles, section: 'Phép tính' },
  { label: 'Phép trừ', to: '/subtraction', icon: BookOpen, section: 'Phép tính' },
  { label: 'Phép nhân', to: '/multiplication', icon: Lightbulb, section: 'Phép tính' },
  { label: 'Phép chia', to: '/division', icon: Calculator, section: 'Phép tính' },
  { label: 'Bảng cửu chương', to: '/tables', icon: Table2 },
  { label: 'Lịch sử học tập', to: '/history', icon: History },
  { label: 'Cài đặt', to: '/settings', icon: Settings },
]
