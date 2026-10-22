import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame, RoleForm } from "@/features/portal/components/auth-flow";
import { authCopy, formatStep } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";

export const metadata: Metadata = { title: "Role" };

export default async function RolePage() {
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame step={{ label: formatStep(copy.step, 2, 4), current: 2, total: 4 }} title={copy.roleTitle} lede={copy.roleLede} copy={copy}>
      <RoleForm copy={copy} />
      <Link href="/portal/language" className="mt-4 text-sm font-medium text-accent">
        {copy.changeLanguage}
      </Link>
    </AuthFrame>
  );
}
