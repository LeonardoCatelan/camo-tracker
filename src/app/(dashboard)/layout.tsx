import { type ReactNode, Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { UserMenu } from "@/features/auth/components/user-menu";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader
        actions={
          // The session is read at request time, so it streams in behind a boundary
          // while the rest of the layout is served from the static shell.
          <Suspense fallback={<div className="h-7 w-20 animate-pulse rounded-md bg-muted" />}>
            <UserMenu />
          </Suspense>
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
