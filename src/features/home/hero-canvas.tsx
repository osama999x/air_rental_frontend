"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { HeroStill } from "./hero-still";
import { heroMotion } from "./hero-motion";

const Scene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <HeroStill />,
});

type Mode = "off" | "still" | "live";

function subscribe(onChange: () => void) {
  const queries = [
    window.matchMedia("(prefers-reduced-motion: reduce)"),
    window.matchMedia("(max-width: 1023px)"),
  ];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function sceneMode(): Mode {
  if (window.matchMedia("(max-width: 1023px)").matches) return "off";
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory <= 4) return "still";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "still";
  return "live";
}

export function HeroCanvas() {
  const mode = useSyncExternalStore(subscribe, sceneMode, () => "off" as Mode);

  useEffect(() => {
    if (mode !== "live") return;
    const onMove = (event: PointerEvent) => {
      const node = document.getElementById("hero-scene");
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const rtl = node.closest("[dir='rtl']") ? -1 : 1;
      heroMotion.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * rtl;
      heroMotion.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  if (mode === "off") return null;

  return (
    <div id="hero-scene" className="hero-float" aria-hidden="true">
      {mode === "live" ? <Scene /> : <HeroStill />}
    </div>
  );
}
