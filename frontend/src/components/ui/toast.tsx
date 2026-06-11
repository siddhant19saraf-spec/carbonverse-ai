import toast, { Toaster } from "react-hot-toast"

import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

function toastNotification({ title, description, variant = "default" }: ToastProps) {
  if (variant === "destructive") {
    return toast.error(
      <div className="flex flex-col gap-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
    )
  }

  return toast(
    <div className="flex flex-col gap-1">
      {title && <p className="text-sm font-semibold">{title}</p>}
      {description && <p className="text-sm opacity-90">{description}</p>}
    </div>
  )
}

const ToastProvider = Toaster

export { toastNotification as toast, ToastProvider }
