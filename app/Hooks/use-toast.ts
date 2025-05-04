// app/hooks/use-toast.ts

import { useToastStore } from "./use-toast-store"

export const useToast = () => {
  const show = useToastStore((s) => s.show)
  return { toast: show }
}
