import type { Metadata } from "next";
import { AuthFrame, ForgotForm } from "@/features/portal/components/auth-flow";
import { authCopy } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPage() {
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  return (
    <AuthFrame title={copy.forgotTitle} lede={copy.forgotLede} copy={copy}>
      <ForgotForm copy={copy} />
    </AuthFrame>
  );
}
