import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-600 text-white shadow-[0_4px_0_#16804a] hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_6px_0_#16804a] active:translate-y-1 active:shadow-none',
        secondary:
          'bg-violet-100 text-violet-800 shadow-[0_3px_0_#d3c8ff] hover:-translate-y-0.5 hover:bg-violet-200',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        destructive: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
      },
      size: {
        default: 'min-h-11 px-4 py-2.5',
        sm: 'min-h-9 rounded-xl px-3',
        lg: 'min-h-13 px-6 text-base',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, size, variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  )
}
