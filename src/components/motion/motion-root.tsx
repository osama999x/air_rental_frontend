"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { duration, easeOut } from "@/lib/motion";

const cardSelector = ".tilt-surface, .surface-card, .admin-card, .record-link, .choice";

function useCardTilt() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    let frame = 0;
    let pending: PointerEvent | null = null;
    let current: HTMLElement | null = null;

    const reset = (card: HTMLElement | null) => {
      if (!card) return;
      card.style.transform = "";
      card.removeAttribute("data-tilted");
    };

    const apply = () => {
      frame = 0;
      const event = pending;
      pending = null;
      if (!event || event.pointerType !== "mouse") return;
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>(cardSelector) ?? null;
      if (current && current !== card) reset(current);
      current = card;
      if (!card) return;
      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      const rtl = card.closest("[dir='rtl']") ? -1 : 1;
      const rotateX = Math.max(-4, Math.min(4, -py * 8));
      const rotateY = Math.max(-4, Math.min(4, px * 8 * rtl));
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      card.dataset.tilted = "true";
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const clear = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>(cardSelector);
      if (!card) return;
      const next = event.relatedTarget;
      if (next instanceof Node && card.contains(next)) return;
      reset(card);
      if (current === card) current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", clear);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", clear);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}

export function MotionRoot({ children }: { children: ReactNode }) {
  useCardTilt();
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: [...easeOut] }}>
      {children}
    </MotionConfig>
  );
}
