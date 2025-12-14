// src/components/ui/alert.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning" | "info";
  onClose?: () => void;
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", children, onClose, ...props }, ref) => {
    const Icon = iconMap[variant];

    return (
      <div
        ref={ref}
        className={cn("alert", `alert-${variant}`, "flex items-start gap-3", className)}
        {...props}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };