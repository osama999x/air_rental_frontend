"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { switchRole } from "@/features/portal/actions";
import { PortalIcon } from "@/features/portal/components/icons";
import { ProfilePhoto } from "@/features/portal/components/loader";
import { linksFor, tabs } from "@/features/portal/nav";
import { portalCopy, roleTitle, type PortalCopy } from "@/features/portal/portal-copy";
import type { PortalProfile, PortalRole } from "@/features/portal/types";

export function PortalShell({
  profile,
  language,
  avatarSrc = null,
  children,
}: {
  profile: PortalProfile;
  language: string;
  avatarSrc?: string | null;
  children: ReactNode;
}) {
  const copy = portalCopy(language);
  return (
    <div className="portal-shell">
      <Sidebar profile={profile} language={language} copy={copy} avatarSrc={avatarSrc} />
      <div className="portal-main">
        <MobileBar profile={profile} language={language} copy={copy} avatarSrc={avatarSrc} />
        <div className="min-h-0 flex-1">{children}</div>
        <TabBar role={profile.activeRole} copy={copy} />
      </div>
    </div>
  );
}

function Sidebar({ profile, language, copy, avatarSrc }: { profile: PortalProfile; language: string; copy: PortalCopy; avatarSrc: string | null }) {
  const pathname = usePathname();
  const primary = tabs[profile.activeRole];
  const extra = linksFor(profile.activeRole).filter((item) => !primary.some((tab) => tab.href === item.href));
  return (
    <aside className="portal-sidebar">
      <div className="px-5 pt-6 pb-4">
        <Link href="/portal/home" className="text-sm font-bold tracking-[0.18em] text-navy">
          AIR RENTAL
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <ProfilePhoto name={`${profile.firstName} ${profile.lastName}`} src={avatarSrc} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy">{profile.firstName} {profile.lastName}</p>
            <p className="text-xs text-muted">{roleTitle(language, profile.activeRole)}</p>
          </div>
        </div>
      </div>
      <nav aria-label="Portal" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted">{copy.menu}</p>
        <ul className="grid gap-1">
          {primary.map((tab) => (
            <li key={tab.href}>
              <NavLink href={tab.href} label={tabLabel(tab.href, profile.activeRole, copy)} icon={tab.icon} active={isActive(pathname, tab.href, tab.exact)} />
            </li>
          ))}
        </ul>
        <p className="mt-5 px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted">{copy.workspace}</p>
        <ul className="grid gap-1">
          {extra.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} label={copy.links[item.href]?.label ?? item.label} icon={item.icon} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-line px-3 py-4">
        <RoleSwitch profile={profile} language={language} copy={copy} />
        <a href="/portal/session/logout" className="mt-3 block w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-muted hover:bg-[#f4f7fb] hover:text-navy">
          {copy.signOut}
        </a>
      </div>
    </aside>
  );
}

function MobileBar({ profile, language, copy, avatarSrc }: { profile: PortalProfile; language: string; copy: PortalCopy; avatarSrc: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/portal/home" className="text-xs font-bold tracking-[0.16em] text-navy">
          AIR RENTAL
        </Link>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-full bg-[#e8f0ff] px-3 py-1.5 text-xs font-semibold text-accent">
            {roleTitle(language, profile.activeRole)}
          </summary>
          <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-line bg-white p-3 shadow-[0_16px_40px_rgba(18,48,92,0.12)]">
            <div className="mb-2 flex items-center gap-2 px-1">
              <ProfilePhoto name={`${profile.firstName} ${profile.lastName}`} src={avatarSrc} />
              <p className="text-sm font-semibold text-navy">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
            <RoleSwitch profile={profile} language={language} copy={copy} />
          </div>
        </details>
      </div>
    </header>
  );
}

function TabBar({ role, copy }: { role: PortalRole; copy: PortalCopy }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Portal" className="sticky bottom-0 z-20 border-t border-line bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <ul className={`grid gap-1 ${tabs[role].length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
        {tabs[role].map((tab) => {
          const active = isActive(pathname, tab.href, tab.exact);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold leading-none transition ${
                  active ? "bg-[#e8f0ff] text-accent" : "text-muted"
                }`}
              >
                <PortalIcon name={tab.icon} className="h-[22px] w-[22px]" />
                {tabLabel(tab.href, role, copy)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: Parameters<typeof PortalIcon>[0]["name"];
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
        active ? "bg-accent text-white" : "text-navy hover:bg-[#f4f7fb]"
      }`}
    >
      <PortalIcon name={icon} className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function tabLabel(href: string, role: PortalRole, copy: PortalCopy) {
  if (href === "/portal/home") return copy.home;
  if (href === "/portal/properties") return copy.properties;
  if (href === "/portal/rent") return role === "TENANT" ? copy.pay : copy.rent;
  if (href === "/portal/bills") return copy.bills;
  if (href === "/portal/repairs") return role === "MANAGER" ? copy.tasks : copy.repairs;
  if (href === "/portal/more") return copy.more;
  return copy.more;
}

function RoleSwitch({ profile, language, copy }: { profile: PortalProfile; language: string; copy: PortalCopy }) {
  const roles: PortalRole[] = ["OWNER", "TENANT", "MANAGER"];
  return (
    <form action={switchRole} className="mt-3 grid gap-1">
      {roles.map((role) => (
        <button
          key={role}
          name="role"
          value={role}
          className={`rounded-xl px-3 py-2 text-left text-sm ${
            profile.activeRole === role ? "bg-accent text-white" : "text-navy hover:bg-[#f4f7fb]"
          }`}
        >
          <span className="block font-semibold">{roleTitle(language, role)}</span>
          <span className={`block text-xs ${profile.activeRole === role ? "text-white/80" : "text-muted"}`}>
            {profile.roles.includes(role) ? copy.onAccount : copy.addRole}
          </span>
        </button>
      ))}
    </form>
  );
}

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
