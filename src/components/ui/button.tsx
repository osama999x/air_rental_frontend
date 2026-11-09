"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { BusyOverlay, overlayLabel } from "@/features/portal/components/loader";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  primary:
    "btn-sheen bg-accent text-accent-foreground shadow-[0_10px_22px_rgba(47,107,255,0.28)] hover:bg-[#245de6]",
  secondary: "border border-line bg-card text-navy shadow-sm hover:bg-[#eef3fb]",
};

const base =
  "btn-press inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium hover:brightness-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function Button({
  variant = "primary",
  className = "",
  type,
  disabled,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  const { pending } = useFormStatus();
  const busy = type === "submit" && (pending || Boolean(disabled));
  return (
    <>
      <BusyOverlay show={busy} label={overlayLabel(children)} />
      <button
        type={type}
        disabled={Boolean(disabled) || (type === "submit" && pending)}
        aria-busy={busy || undefined}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {busy ? <span className="me-2 inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </button>
    </>
  );
}
