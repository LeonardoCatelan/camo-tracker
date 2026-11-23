import { type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface FormFieldProps extends ComponentProps<typeof Input> {
  id: string;
  label: string;
  error?: string | undefined;
  description?: string;
}

/** Labeled input with accessible error and description wiring. */
export function FormField({
  id,
  label,
  error,
  description,
  className,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(" ");

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {description && !error ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
