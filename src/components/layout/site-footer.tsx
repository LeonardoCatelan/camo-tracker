import { SITE_CONFIG } from "@/constants/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 text-sm text-muted-foreground sm:px-6">
        {SITE_CONFIG.name}
      </div>
    </footer>
  );
}
