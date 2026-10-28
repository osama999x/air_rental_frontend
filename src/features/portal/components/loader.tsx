"use client";

import { useState } from "react";

export function Loader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-sm text-muted" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#d5e0f0] border-t-accent" />
      {label}
    </div>
  );
}

export function PropertyPhoto({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  return (
    <div className="relative h-36 bg-[#eef3fb]">
      {state === "loading" ? (
        <span className="absolute inset-0 m-auto h-6 w-6 animate-spin rounded-full border-2 border-[#d5e0f0] border-t-accent" />
      ) : null}
      {state === "failed" ? (
        <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-muted">Photo unavailable</span>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`h-36 w-full object-cover ${state === "ready" ? "" : "opacity-0"}`}
          onLoad={() => setState("ready")}
          onError={() => setState("failed")}
        />
      )}
    </div>
  );
}
