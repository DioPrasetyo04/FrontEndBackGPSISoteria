import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Separator> & { children?: React.ReactNode }) {
  if (children) {
    return (
      <div className={cn("relative flex items-center justify-center text-xs uppercase", className)}>
        <Separator className="absolute left-0 right-0 top-1/2 -translate-y-1/2" />
        <span
          data-slot="field-separator-content"
          className="relative z-10 bg-background px-2 text-muted-foreground"
        >
          {children}
        </span>
      </div>
    )
  }
  return <Separator className={className} {...props} />
}

export {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
}
