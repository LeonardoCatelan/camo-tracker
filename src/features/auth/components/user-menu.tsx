import { CircleUser } from "lucide-react";

import { getCurrentUser } from "../services/session.service";

import { SignOutButton } from "./sign-out-button";

/** Reads the session at request time: render it inside a <Suspense> boundary. */
export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
        <CircleUser className="size-4" aria-hidden />
        {user.email}
      </span>
      <SignOutButton />
    </div>
  );
}
