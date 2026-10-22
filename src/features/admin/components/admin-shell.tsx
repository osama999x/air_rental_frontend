"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutAdmin } from "@/features/admin/actions";
import { adminNav } from "@/features/admin/nav";
import type { AdminProfile } from "@/features/admin/types";

export function AdminShell({
  profile,
  children,
}: {
  profile: AdminProfile;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="admin-shell flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:shadow-[8px_0_30px_rgba(18,48,92,0.04)]">
        <div className="px-5 pt-6 pb-4">
          <Link href="/admin" className="text-lg font-bold tracking-[0.18em] text-navy">
            AIR RENTAL
          </Link>
          <p className="mt-1 text-xs text-muted">Admin</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:pb-4">
          {adminNav.map((item) => {
            const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-3 py-2.5 text-sm font-medium whitespace-nowrap ${
                  active ? "bg-accent text-accent-foreground" : "text-navy hover:bg-[#eef3fb]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 border-t border-line px-4 py-4 lg:flex">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f0ff] text-sm font-semibold text-accent">
            {profile.displayName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile.displayName}</p>
            <p className="truncate text-xs text-muted">{profile.email}</p>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">{greeting()}</p>
            <p className="text-2xl font-semibold tracking-tight text-navy">{profile.displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="admin-card px-4 py-2 text-sm font-medium">{today}</p>
            <form action={signOutAdmin} className="lg:hidden">
              <button type="submit" className="rounded-full bg-card px-4 py-2 text-sm font-medium shadow-sm">
                Sign out
              </button>
            </form>
            <form action={signOutAdmin} className="hidden lg:block">
              <button type="submit" className="rounded-full bg-card px-4 py-2 text-sm font-medium text-navy shadow-sm">
                Sign out
              </button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
