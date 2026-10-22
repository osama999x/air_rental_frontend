import type { ReactNode } from "react";
import { prettyLabel } from "@/features/admin/format";

export function PageIntro({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-navy">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {meta ? <p className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted shadow-sm">{meta}</p> : null}
    </div>
  );
}

export function Notice({ message }: { message: string }) {
  return (
    <p className="admin-card px-4 py-3 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

export function SearchBar({
  action,
  defaultValue,
  placeholder = "Search here",
}: {
  action: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} className="mb-4">
      <label className="relative block">
        <span className="sr-only">Search</span>
        <input
          name="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-12 w-full rounded-full border border-line bg-card pr-28 pl-5 text-sm shadow-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="absolute top-1 right-1 h-10 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground"
        >
          Search
        </button>
      </label>
    </form>
  );
}

export function RecordList({
  empty,
  children,
  count,
}: {
  empty: string;
  children: ReactNode;
  count: number;
}) {
  if (count === 0) {
    return <p className="admin-card px-4 py-10 text-center text-sm text-muted">{empty}</p>;
  }
  return <div className="grid gap-3">{children}</div>;
}

export function RecordCard({
  eyebrow,
  title,
  chip,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  chip?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <article className="admin-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-medium text-muted">{eyebrow}</p> : null}
          <h2 className="truncate text-base font-semibold text-navy">{title}</h2>
        </div>
        {chip}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      {action ? <div className="mt-4 border-t border-line pt-4">{action}</div> : null}
    </article>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 text-sm break-words text-foreground">{value || "—"}</p>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-muted">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <PageLink href={page > 1 ? hrefFor(page - 1) : undefined} label="Previous" />
        <PageLink href={page < pages ? hrefFor(page + 1) : undefined} label="Next" />
      </div>
    </div>
  );
}

function PageLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return <span className="rounded-full px-4 py-2 text-muted">{label}</span>;
  }
  return (
    <a href={href} className="rounded-full bg-card px-4 py-2 font-medium text-navy shadow-sm">
      {label}
    </a>
  );
}

export function PanelSkeleton() {
  return (
    <div className="grid gap-3">
      <div className="h-8 w-48 animate-pulse rounded-full bg-line" />
      <div className="h-40 animate-pulse rounded-3xl bg-line" />
      <div className="h-28 animate-pulse rounded-3xl bg-line" />
    </div>
  );
}

export function StatusChip({ value }: { value: string | boolean }) {
  const raw = typeof value === "boolean" ? (value ? "ENABLED" : "DISABLED") : value;
  const tone = chipTone(raw.toUpperCase());
  const label = typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : prettyLabel(value);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{label}</span>;
}

function chipTone(value: string) {
  if (["ACTIVE", "ENABLED", "SUCCEEDED", "RESOLVED", "PAID", "RENTED"].includes(value)) {
    return "bg-emerald-100 text-emerald-800";
  }
  if (["SUSPENDED", "FAILED", "DEAD", "PAST_DUE", "DEACTIVATED", "REJECTED"].includes(value)) {
    return "bg-red-100 text-red-800";
  }
  if (["PENDING", "TRIALING", "OPEN", "IN_PROGRESS", "VACANT", "DISABLED"].includes(value)) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-[#eef3fb] text-navy";
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <article className="admin-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-navy">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
    </article>
  );
}
