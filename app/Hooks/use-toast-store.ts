// app/stores/use-toast-store.ts
import { create } from 'zustand'

type ToastVariant = 'default' | 'success' | 'error'

type ToastState = {
  open: boolean
  title: string
  description?: string
  variant: ToastVariant
  duration?: number // 👈 追加
  show: (params: { title: string; description?: string; variant?: ToastVariant; duration?: number }) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  open: false,
  title: '',
  description: '',
  variant: 'default',
  duration: 3000,
  show: ({ title, description, variant = 'default', duration = 3000 }) =>
    set({ open: true, title, description, variant, duration }),
  hide: () => set({ open: false }),
}))