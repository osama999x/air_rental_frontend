"use client";

import { useCallback, useState, type ReactNode } from "react";

export function Loader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-sm text-muted" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#d5e0f0] border-t-accent" />
      {label}
    </div>
  );
}

export function BusyOverlay({ show, label }: { show: boolean; label: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#f4f7fb]/75 px-6" role="status" aria-live="polite">
      <div className="flex min-w-56 flex-col items-center gap-3 rounded-[28px] bg-white px-8 py-7 shadow-[0_20px_50px_rgba(18,48,92,0.12)]">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5e0f0] border-t-accent" />
        <p className="text-sm font-semibold text-navy">{label}</p>
      </div>
    </div>
  );
}

function PhotoFrame({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">(src ? "loading" : "failed");
  const attach = useCallback((node: HTMLImageElement | null) => {
    if (!node) return;
    let frame = 0;
    let settled = false;
    const settle = (next: "ready" | "failed") => {
      if (settled) return;
      settled = true;
      cancelAnimationFrame(frame);
      setState(next);
    };
    const look = () => {
      if (!node.isConnected || settled) return;
      if (node.naturalWidth > 0) {
        settle("ready");
        return;
      }
      if (node.complete) {
        settle("failed");
        return;
      }
      frame = requestAnimationFrame(look);
    };
    const onError = () => settle("failed");
    node.addEventListener("error", onError);
    look();
    return () => {
      settled = true;
      cancelAnimationFrame(frame);
      node.removeEventListener("error", onError);
    };
  }, []);

  if (!src || state === "failed") {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-[#eef3fb] px-3 text-center text-xs text-muted">
        Photo unavailable
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3fb]">
      {state === "loading" ? (
        <span className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-[#d5e0f0] border-t-accent" />
      ) : null}
      <img ref={attach} src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

export function PropertyPhoto({ src, alt }: { src: string; alt: string }) {
  return <PhotoFrame key={src} src={src} alt={alt} />;
}

export function FilePicker({ name, accept, required = false }: { name: string; accept: string; required?: boolean }) {
  const [fileName, setFileName] = useState("");
  return (
    <label className="form-wide flex h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-[#c5d4ea] bg-white px-4 text-sm">
      <span className="min-w-0 truncate font-medium text-navy">{fileName || "Choose a file"}</span>
      <span className="shrink-0 rounded-full bg-[#e7efff] px-3 py-1 text-xs font-semibold text-accent">Browse</span>
      <input
        name={name}
        type="file"
        required={required}
        accept={accept}
        className="sr-only"
        onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
      />
    </label>
  );
}

export function overlayLabel(children: ReactNode) {
  return typeof children === "string" && children.trim() ? children : "Please wait…";
}
