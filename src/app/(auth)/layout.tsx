import { type ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </>
  );
}
