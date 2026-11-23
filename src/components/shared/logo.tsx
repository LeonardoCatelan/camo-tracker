import { Crosshair } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

export function Logo() {
  return (
    <Link
      href={ROUTES.home}
      className="flex items-center gap-2 focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none"
    >
      <span className="flex size-8 items-center justify-center rounded-[3px] border border-olive bg-primary text-primary-foreground">
        <Crosshair className="size-5" aria-hidden />
      </span>
      <span className="font-display-caps text-lg leading-none font-extrabold tracking-wider">
        {SITE_CONFIG.name}
      </span>
      <span className="hidden rounded-[2px] bg-highlight px-1 font-hud text-[11px] leading-4 text-highlight-foreground sm:inline">
        MW4
      </span>
    </Link>
  );
}
