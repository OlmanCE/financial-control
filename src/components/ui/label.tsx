// src/components/ui/label.tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn("label", className)} {...props}>
      {children}
      {required && (
        <span className="text-destructive ml-1" aria-label="required">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  ),
)

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
