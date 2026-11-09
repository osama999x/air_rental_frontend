import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthFrame, SignupForm } from "@/features/portal/components/auth-flow";
import { authCopy, formatStep } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage({ searchParams }: { searchParams: Promise<{ invite?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <SignupScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function SignupScreen({ searchParams }: { searchParams: Promise<{ invite?: string | string[] }> }) {
  const invite = readParam((await searchParams).invite);
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame step={{ label: formatStep(copy.step, 4, 4), current: 4, total: 4 }} title={copy.signupTitle} lede={invite ? "Create an account, then the invitation opens again." : copy.signupLede} copy={copy}>
      <SignupForm copy={copy} invite={invite} />
      <Link href="/portal/language" className="mt-4 text-center text-sm font-medium text-accent-ink">
        {copy.changeLanguage}
      </Link>
    </AuthFrame>
  );
}
