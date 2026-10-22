import Link from "next/link";
import type { ReactNode } from "react";

const chipTones = {
  overdue: "bg-[#ffe8ea] text-[#d1264a]",
  pending: "bg-[#f3e8ff] text-[#7a3ff2]",
  due: "bg-[#e7efff] text-[#2f6bff]",
  paid: "bg-[#e5f8ee] text-[#15803d]",
  neutral: "bg-[#eef2f7] text-[#5c6b82]",
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

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: ChipTone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${chipTones[tone]}`}>{children}</span>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="portal-canvas rise-in mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-5 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
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
        {kicker ? <p className="text-xs font-semibold tracking-[0.16em] text-accent">{kicker}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Notice({ message, tone = "error" }: { message: string; tone?: "error" | "ok" }) {
  if (!message) return null;
  return (
    <p className={`mb-4 rounded-2xl px-4 py-3 text-sm ${tone === "ok" ? "bg-[#e5f8ee] text-[#166534]" : "bg-[#ffe8ea] text-[#9f1239]"}`} role="status">
      {message}
    </p>
  );
}

export function EmptyState({ title, body, href, label }: { title: string; body: string; href?: string; label?: string }) {
  return (
    <div className="rounded-[24px] bg-white px-5 py-8 text-center shadow-[0_10px_30px_rgba(18,48,92,0.06)]">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      {href && label ? (
        <Link href={href} className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white">
          {label}
        </Link>
      ) : null}
    </div>
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
    <section className="rounded-[28px] bg-gradient-to-br from-[#16356a] to-[#0d2248] p-5 text-white shadow-[0_16px_40px_rgba(18,48,92,0.22)]">
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
        <li key={item.label} className="rounded-[22px] bg-white px-3 py-3 text-center shadow-[0_8px_24px_rgba(18,48,92,0.05)]">
          <p className="text-xl font-semibold text-navy">{item.value}</p>
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
    <Link href={href} className="record-link flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-[0_8px_24px_rgba(18,48,92,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,48,92,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f0ff] text-sm font-semibold text-accent">
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
  "h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-accent focus:ring-4 focus:ring-[#2f6bff]/10";

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="mb-3 inline-flex text-sm font-medium text-accent">
      {label}
    </Link>
  );
}
