import { toast } from "sonner"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastOptions {
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

export function useToast() {
  const showToast = (message: string, type: ToastType = "info", options?: ToastOptions) => {
    const config = {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
    }

    switch (type) {
      case "success":
        return toast.success(message, config)
      case "error":
        return toast.error(message, config)
      case "warning":
        return toast.warning(message, config)
      default:
        return toast(message, config)
    }
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  return { toast: showToast, dismiss }
}