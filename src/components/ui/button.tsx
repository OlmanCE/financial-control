// src/components/ui/button.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, isLoading, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[40px]", // Mobile-friendly minimum
      md: "px-5 py-3 text-base min-h-[44px]", // Standard touch target
      lg: "px-6 py-4 text-lg min-h-[52px]", // Large touch target
    }

    return (
      <button
        className={cn(
          "btn",
          variant && `btn-${variant}`,
          sizeClasses[size],
          isLoading && "opacity-70 cursor-wait",
          className,
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button }
