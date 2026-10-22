import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame, SignupForm } from "@/features/portal/components/auth-flow";
import { authCopy, formatStep } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame step={{ label: formatStep(copy.step, 4, 4), current: 4, total: 4 }} title={copy.signupTitle} lede={copy.signupLede} copy={copy}>
      <SignupForm copy={copy} />
      <Link href="/portal/language" className="mt-4 text-center text-sm font-medium text-accent">
        {copy.changeLanguage}
      </Link>
    </AuthFrame>
  );
}
