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
  const [isExiting, setIsExiting] = React.useState(false)

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const variantClasses = {
    error: "toast-error",
    success: "toast-success",
    warning: "toast-warning",
    info: "toast-info",
  }

  return (
    <div className="toast-container">
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          "toast-base",
          variantClasses[variant],
          isExiting && "toast-exit"
        )}
      >
        {/* Icon */}
        <div className="toast-icon">
          <Icon aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="toast-content">
          <h3 className="toast-title">{title}</h3>
          {description && <p className="toast-description">{description}</p>}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={() => {
              setIsExiting(true)
              setTimeout(() => {
                setIsVisible(false)
                onClose()
              }, 300)
            }}
            className="toast-close"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Progress Bar */}
        {duration > 0 && (
          <div 
            className="toast-progress" 
            style={{ '--duration': `${duration}ms` } as React.CSSProperties}
          />
        )}
      </div>
    </div>
  )
}