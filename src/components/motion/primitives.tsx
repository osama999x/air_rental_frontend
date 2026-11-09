import type { ReactNode } from "react";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-3xl ${className}`} />;
}

export function SkeletonList() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      <SkeletonBlock className="h-10 w-48 rounded-full" />
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-20" />
      <SkeletonBlock className="h-20" />
    </div>
  );
}

export function StaggerList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`stagger-list ${className}`}>{children}</div>;
}

export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`tilt-surface ${className}`}>{children}</div>;
}
