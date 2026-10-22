import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PortalShell } from "@/features/portal/components/shell";
import { readPortalProfile } from "@/features/portal/session";

export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Opening your portal…</p>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: ReactNode }) {
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
