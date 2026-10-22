import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm, AuthFrame } from "@/features/portal/components/auth-flow";
import { authCopy, formatStep } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";

export const metadata: Metadata = { title: "Account type" };

export default async function AccountPage() {
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame step={{ label: formatStep(copy.step, 3, 4), current: 3, total: 4 }} title={copy.accountTitle} lede={copy.accountLede} copy={copy}>
      <AccountForm copy={copy} />
      <Link href="/portal/language" className="mt-4 text-sm font-medium text-accent">
        {copy.changeLanguage}
      </Link>
    </AuthFrame>
  );
}
