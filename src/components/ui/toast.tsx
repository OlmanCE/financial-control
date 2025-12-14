// src/components/ui/toast.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export interface ToastProps {
  variant?: "error" | "success" | "warning" | "info";
  title: string;
  description?: string;
  onClose?: () => void;
  duration?: number; // milisegundos, 0 = no auto-close
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Toast: React.FC<ToastProps> = ({
  variant = "info",
  title,
  description,
  onClose,
  duration = 5000,
}) => {
  const Icon = iconMap[variant];
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Esperar a que termine la animación
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const variantStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconStyles = {
    error: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 animate-slide-in rounded-lg border p-4 shadow-lg max-w-md",
        variantStyles[variant],
        !isVisible && "animate-slide-out"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={cn("w-5 h-5", iconStyles[variant])} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 5000);
            }}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};