import { type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { type ComponentProps } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type LinkButtonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/**
 * Navigation styled as a button. Keeps link semantics (`<a>` with role "link"),
 * unlike rendering the Base UI Button as a link, which announces it as a button.
 */
export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
