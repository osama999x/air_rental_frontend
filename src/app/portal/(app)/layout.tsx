import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readAvatarDataUrl } from "@/features/portal/avatar";
import { Loader } from "@/features/portal/components/loader";
import { PortalShell } from "@/features/portal/components/shell";
import { readAccessToken, readOnboarding, readPortalProfile } from "@/features/portal/session";

export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loader label="Opening your portal…" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: ReactNode }) {
  const [profile, token] = await Promise.all([readPortalProfile(), readAccessToken()]);
  if (!profile || !token) redirect("/portal/session/end");
  const { language } = await readOnboarding();
  const avatarSrc = await readAvatarDataUrl();
  return (
    <PortalShell profile={profile} language={language} avatarSrc={avatarSrc}>
      {children}
    </PortalShell>
  );
}
