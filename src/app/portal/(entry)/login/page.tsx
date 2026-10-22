import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthFrame, LoginForm } from "@/features/portal/components/auth-flow";
import { authCopy } from "@/features/portal/i18n";
import { readOnboarding, readPortalProfile } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginScreen({ searchParams }: { searchParams: Promise<{ reset?: string | string[] }> }) {
  if (await readPortalProfile()) redirect("/portal/home");
  const reset = readParam((await searchParams).reset) === "1";
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame title={copy.loginTitle} lede={copy.loginLede} copy={copy}>
      <LoginForm reset={reset} copy={copy} />
    </AuthFrame>
  );
}
