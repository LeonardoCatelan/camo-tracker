import { Loader2 } from "lucide-react";
import { type ComponentProps } from "react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends Omit<ComponentProps<typeof Button>, "type"> {
  isPending: boolean;
  pendingLabel?: string;
}

export function SubmitButton({
  isPending,
  pendingLabel,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled ?? isPending} aria-busy={isPending} {...props}>
      {isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {isPending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
