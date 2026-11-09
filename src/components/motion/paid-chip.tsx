"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export function PaidChip({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span className="chip-paid inline-flex rounded-full px-2.5 py-1 text-xs font-semibold">{children}</span>;
  }

  return (
    <span className="paid-moment inline-flex items-center gap-1">
      <span className="paid-flip is-paid">
        <span className="paid-face chip-due">Due</span>
        <span className="paid-face paid-back chip-paid">{children}</span>
      </span>
      <span className="coin" aria-hidden="true" />
      <span className="sparks" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
