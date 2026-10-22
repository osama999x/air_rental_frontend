import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFrame, ResetForm } from "@/features/portal/components/auth-flow";
import { authCopy } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <ResetScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetScreen({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const email = readParam((await searchParams).email) ?? "";
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame title={copy.resetTitle} lede={copy.resetLede} copy={copy}>
      <ResetForm email={email} copy={copy} />
    </AuthFrame>
  );
}
