import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader } from "@/features/portal/components/loader";
import { PortalShell } from "@/features/portal/components/shell";
import { readOnboarding, readPortalProfile } from "@/features/portal/session";

export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loader label="Opening your portal…" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: ReactNode }) {
  const profile = await readPortalProfile();
  if (!profile) redirect("/portal/login");
  const { language } = await readOnboarding();
  return (
    <PortalShell profile={profile} language={language}>
      {children}
    </PortalShell>
  );
}
