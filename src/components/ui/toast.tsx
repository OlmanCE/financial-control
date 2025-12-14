// src/components/ui/toast.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

export interface ToastProps {
  variant?: "error" | "success" | "warning" | "info"
  title: string
  description?: string
  onClose?: () => void
  duration?: number
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

export const Toast: React.FC<ToastProps> = ({ variant = "info", title, description, onClose, duration = 5000 }) => {
  const Icon = iconMap[variant]
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const variantClasses = {
    error: "alert-error",
    success: "alert-success",
    warning: "alert-warning",
    info: "alert-info",
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed top-4 right-4 z-50 rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-0",
        "animate-slide-in p-4 flex items-start gap-3",
        variantClasses[variant],
        !isVisible && "animate-slide-out",
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {description && <p className="mt-1 text-sm opacity-90 leading-relaxed">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(), 300)
          }}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
