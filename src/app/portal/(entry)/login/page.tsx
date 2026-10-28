import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthFrame, LoginForm } from "@/features/portal/components/auth-flow";
import { authCopy } from "@/features/portal/i18n";
import { readAccessToken, readOnboarding, readPortalProfile } from "@/features/portal/session";
import { readParam } from "@/lib/format";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string | string[]; expired?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading…</p>}>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginScreen({ searchParams }: { searchParams: Promise<{ reset?: string | string[]; expired?: string | string[] }> }) {
  const params = await searchParams;
  const [profile, token] = await Promise.all([readPortalProfile(), readAccessToken()]);
  if (profile && token && readParam(params.expired) !== "1") redirect("/portal/home");
  const reset = readParam(params.reset) === "1";
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame title={copy.loginTitle} lede={copy.loginLede} copy={copy}>
      <LoginForm reset={reset} copy={copy} />
    </AuthFrame>
  );
}
