import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { PaidChip } from "@/components/motion/paid-chip";
import { TiltCard } from "@/components/motion/primitives";

const chipTones = {
  overdue: "chip-overdue",
  pending: "chip-pending",
  due: "chip-due",
  paid: "chip-paid",
  neutral: "chip-neutral",
} as const;

export type ChipTone = keyof typeof chipTones;

export function statusTone(status?: string): ChipTone {
  const value = (status ?? "").toUpperCase();
  if (value.includes("OVERDUE") || value.includes("REJECT") || value.includes("EXPIRED")) return "overdue";
  if (value.includes("PEND") || value.includes("PROOF") || value.includes("REVIEW") || value.includes("INVIT")) return "pending";
  if (value.includes("PAID") || value.includes("COMPLETE") || value.includes("ACTIVE") || value.includes("CONFIRM")) return "paid";
  if (value.includes("DUE") || value.includes("NEW") || value.includes("RENTED") || value.includes("ISSUED")) return "due";
  return "neutral";
}

export function Chip({
  children,
  tone = "neutral",
  celebrate = false,
}: {
  children: ReactNode;
  tone?: ChipTone;
  celebrate?: boolean;
}) {
  if (celebrate && tone === "paid") return <PaidChip>{children}</PaidChip>;
  const motionClass = tone === "overdue" || tone === "due" ? "chip-pulse" : "chip-in";
  return (
    <span className={`${motionClass} inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${chipTones[tone]}`}>{children}</span>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="portal-canvas mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-5 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
      {children}
    </div>
  );
}

export function PageTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {kicker ? <p className="text-xs font-semibold tracking-[0.16em] text-accent-ink">{kicker}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Notice({ message, tone = "error" }: { message: string; tone?: "error" | "ok" }) {
  if (!message) return null;
  return (
    <p className={`notice-in mb-4 rounded-2xl px-4 py-3 text-sm ${tone === "ok" ? "notice-ok notice-settle" : "notice-err"}`} role="status">
      {tone === "ok" ? (
        <svg viewBox="0 0 16 16" className="me-2 inline h-4 w-4 align-text-bottom" aria-hidden="true">
          <path className="check-draw" d="M3 8.5 6.2 11.5 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {message}
    </p>
  );
}

export function EmptyState({ title, body, href, label }: { title: string; body: string; href?: string; label?: string }) {
  return (
    <TiltCard className="rounded-[24px] bg-card px-5 py-8 text-center">
      <EmptyGlyph title={title} />
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      {href && label ? (
        <Link href={href} className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white">
          {label}
        </Link>
      ) : null}
    </TiltCard>
  );
}

export function MoneyCard({
  label,
  amount,
  detail,
}: {
  label: string;
  amount: string;
  detail: string;
}) {
  return (
    <section className="tilt-surface money-card rounded-[28px] bg-gradient-to-br from-[#16356a] to-[#0d2248] p-5 text-white">
      <p className="text-xs font-semibold tracking-[0.16em] text-white/70">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight">{amount}</p>
      <p className="mt-2 text-sm text-white/80">{detail}</p>
    </section>
  );
}

export function StatRow({
  items,
  className = "",
}: {
  items: { label: string; value: string | number }[];
  className?: string;
}) {
  return (
    <ul className={`mt-4 grid grid-cols-3 gap-2 sm:gap-3 ${className}`}>
      {items.map((item) => (
        <li key={item.label} className="tilt-surface stat-depth rounded-[22px] bg-card px-3 py-3 text-center">
          <p className="text-xl font-semibold text-navy">{typeof item.value === "number" ? <AnimatedNumber value={item.value} /> : item.value}</p>
          <p className="mt-1 text-xs text-muted">{item.label}</p>
        </li>
      ))}
    </ul>
  );
}

export function RecordLink({
  href,
  mark,
  title,
  subtitle,
  amount,
  status,
}: {
  href: string;
  mark: string;
  title: string;
  subtitle?: string;
  amount?: string;
  status?: string;
}) {
  return (
    <Link href={href} className="record-link hover-lift flex items-center gap-3 rounded-[22px] bg-card p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent-ink">
        {mark.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-navy">{title}</span>
        {subtitle ? <span className="block truncate text-sm text-muted">{subtitle}</span> : null}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        {amount ? <span className="text-sm font-semibold text-navy">{amount}</span> : null}
        {status ? <Chip tone={statusTone(status)}>{labelize(status)}</Chip> : null}
      </span>
    </Link>
  );
}

function EmptyGlyph({ title }: { title: string }) {
  const kind = /doc|file|agree|proof|ident/i.test(title) ? "document" : /propert|house|home|repair|bill/i.test(title) ? "house" : "key";
  return (
    <span className="idle-bob mx-auto mb-4 grid h-12 w-12 place-items-center text-accent-ink">
      {kind === "house" ? <HouseGlyph /> : kind === "document" ? <DocumentGlyph /> : <KeyGlyph />}
    </span>
  );
}

function KeyGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden="true">
      <circle cx="16" cy="20" r="8" stroke="currentColor" strokeWidth="2.4" />
      <path d="M22 24.5 38 40M32 34h6M34 40h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function HouseGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden="true">
      <path d="M8 22 24 8l16 14v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V22Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M20 40V28h8v12" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden="true">
      <path d="M14 8h14l8 8v24a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M28 8v8h8M18 26h12M18 32h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function labelize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-navy">
      {label}
      {children}
    </label>
  );
}

export const fieldClass =
  "field-control h-12 w-full rounded-2xl border border-line bg-card px-4 text-sm font-normal text-navy outline-none focus:border-accent";

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="mb-3 inline-flex text-sm font-medium text-accent-ink">
      {label}
    </Link>
  );
}
