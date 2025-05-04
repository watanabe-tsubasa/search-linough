// app/components/ToastRenderer.tsx

import { useToastStore } from "~/Hooks/use-toast-store"
import { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport } from "./Toast"

export function ToastRenderer() {
  const { open, title, description, variant, duration, hide } = useToastStore();

  return (
    <>
      <Toast
        open={open}
        onOpenChange={hide}
        variant={variant}
        duration={duration} // 👈 ここを忘れずに
      >
        <div>
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </>
  );
}