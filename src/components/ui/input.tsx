// src/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  errorMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, leftIcon, rightIcon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</div>}
          <input
            type={type}
            className={cn("input", error && "input-error", leftIcon && "pl-10", rightIcon && "pr-10", className)}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={errorMessage ? `${props.id}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</div>
          )}
        </div>
        {errorMessage && (
          <p id={`${props.id}-error`} className="mt-1.5 text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input }
