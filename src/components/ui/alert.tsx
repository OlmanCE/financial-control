// src/components/ui/alert.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning" | "info"
  title?: string
  onClose?: () => void
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, children, onClose, ...props }, ref) => {
    const Icon = iconMap[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn("alert", `alert-${variant}`, "flex items-start gap-3 p-4 rounded-lg", className)}
        {...props}
      >
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)

Alert.displayName = "Alert"

export { Alert }
