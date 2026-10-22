"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/site";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex max-w-[62vw] items-center gap-1 overflow-x-auto sm:max-w-none">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active ? "bg-accent text-accent-foreground" : "text-muted hover:bg-[#eef3fb] hover:text-navy"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
