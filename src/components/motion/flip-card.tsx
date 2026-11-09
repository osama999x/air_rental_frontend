"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export function FlipCard({
  children,
  back,
}: {
  children: ReactNode;
  back: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const hoverOn = () => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    setOpen(true);
  };
  const hoverOff = () => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    setOpen(false);
  };

  return (
    <div className={`flip-card ${open ? "is-flipped" : ""}`} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
      <div className="flip-inner">
        <div className="flip-face">{children}</div>
        <div className="flip-face flip-back" aria-hidden={!open}>
          {back}
        </div>
      </div>
      <button
        type="button"
        className="flip-toggle"
        aria-pressed={open}
        aria-label={open ? "Show the property summary" : "Show rent, size, and area"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
    </div>
  );
}
