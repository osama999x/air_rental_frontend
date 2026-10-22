import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/features/portal/components/auth-flow";
import { authCopy } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";

export const metadata: Metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame title={copy.welcomeTitle} lede={copy.welcomeLede} copy={copy}>
      <div className="mt-auto grid gap-3">
        <Link href="/portal/language" className="inline-flex h-12 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
          {copy.getStarted}
        </Link>
        <Link href="/portal/login" className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white text-sm font-medium text-navy">
          {copy.haveAccount}
        </Link>
      </div>
    </AuthFrame>
  );
}
