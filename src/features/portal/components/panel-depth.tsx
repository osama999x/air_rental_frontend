"use client";

import { useEffect, useRef } from "react";

export function PanelDepth() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const panel = node?.closest(".portal-auth-panel") as HTMLElement | null;
    if (!node || !panel) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    const onMove = (event: PointerEvent) => {
      const bounds = panel.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const rtl = panel.closest("[dir='rtl']") ? -1 : 1;
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * rtl;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      node.style.setProperty("--px", x.toFixed(3));
      node.style.setProperty("--py", y.toFixed(3));
    };
    const reset = () => {
      node.style.setProperty("--px", "0");
      node.style.setProperty("--py", "0");
    };

    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerleave", reset);
    return () => {
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div ref={ref} className="panel-depth" aria-hidden="true">
      <span className="panel-shape panel-shape-a" />
      <span className="panel-shape panel-shape-b" />
      <span className="panel-shape panel-shape-c" />
    </div>
  );
}
