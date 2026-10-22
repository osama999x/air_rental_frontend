import type { ReactNode } from "react";
import { Suspense } from "react";
import { isRtl } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";

export const instant = false;

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="portal-stage">
      <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
        <LocalizedPortal>{children}</LocalizedPortal>
      </Suspense>
    </div>
  );
}

async function LocalizedPortal({ children }: { children: ReactNode }) {
  const { language } = await readOnboarding();
  return (
    <div className="portal-device" lang={language} dir={isRtl(language) ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
