import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl font-semibold shadow-lg',
          title: 'font-extrabold',
          description: 'text-sm',
        },
      }}
    />
  )
}
