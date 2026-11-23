import { Crosshair } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

export function Logo() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Crosshair className="size-4" aria-hidden />
      </span>
      {SITE_CONFIG.name}
    </Link>
  );
}
