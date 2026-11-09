"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useCountUp(ref, value, Boolean(reduce));
  return (
    <span ref={ref} className="inline-grid tabular-nums" aria-label={String(value)}>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">{value}</span>
      <span className="col-start-1 row-start-1" aria-hidden="true">{shown}</span>
    </span>
  );
}

export function CountText({
  template,
  values,
}: {
  template: string;
  values: Record<string, number>;
}) {
  const parts = template.split(/(\{[a-zA-Z]+\})/g);
  const nodes: ReactNode[] = parts.map((part, index) => {
    const key = part.match(/^\{([a-zA-Z]+)\}$/)?.[1];
    if (key && Object.prototype.hasOwnProperty.call(values, key)) {
      return <AnimatedNumber key={index} value={values[key]} />;
    }
    return <span key={index}>{part}</span>;
  });
  return <>{nodes}</>;
}

function useCountUp(ref: RefObject<HTMLSpanElement | null>, value: number, reduce: boolean) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce || !Number.isFinite(value)) return;
    const host = ref.current;
    let frame = 0;
    let observer: IntersectionObserver | null = null;
    const start = () => {
      const began = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / 700);
        const eased = 1 - (1 - progress) ** 3;
        setShown(Math.round(value * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };
    if (!host || typeof IntersectionObserver === "undefined") {
      start();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer?.disconnect();
          start();
        },
        { threshold: 0.4 },
      );
      observer.observe(host);
    }
    return () => {
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduce, ref, value]);

  if (reduce || !Number.isFinite(value)) return value;
  return shown;
}
