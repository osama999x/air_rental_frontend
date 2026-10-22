import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFrame, VerifyForm } from "@/features/portal/components/auth-flow";
import { authCopy } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; resent?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <VerifyScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyScreen({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; resent?: string | string[] }>;
}) {
  const params = await searchParams;
  const email = readParam(params.email) ?? "";
  const resent = readParam(params.resent) === "1";
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame title={copy.verifyTitle} lede={copy.verifyLede} copy={copy}>
      <VerifyForm email={email} resent={resent} copy={copy} />
    </AuthFrame>
  );
}
