import {
  BookOpen,
  CalendarDays,
  Home,
  Lightbulb,
  Settings,
  Sparkles,
  Table2,
  type LucideIcon,
} from 'lucide-react'

export type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { label: 'Trang chủ', to: '/', icon: Home },
  { label: 'Bài tập hôm nay', to: '/daily', icon: CalendarDays },
  { label: 'Phép cộng', to: '/addition', icon: Sparkles },
  { label: 'Phép trừ', to: '/subtraction', icon: BookOpen },
  { label: 'Phép nhân', to: '/multiplication', icon: Lightbulb },
  { label: 'Bảng cửu chương', to: '/tables', icon: Table2 },
  { label: 'Cài đặt', to: '/settings', icon: Settings },
]
