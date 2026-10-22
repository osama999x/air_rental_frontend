import type { Metadata } from "next";
import { Suspense } from "react";
import { asList, portalCall } from "@/features/portal/api";
import { AuthFrame, LanguageForm } from "@/features/portal/components/auth-flow";
import { authCopy, formatStep } from "@/features/portal/i18n";
import { readOnboarding } from "@/features/portal/session";
import type { NamedRecord } from "@/features/portal/types";

export const metadata: Metadata = { title: "Language" };

const fallback = [
  { code: "en", name: "English" },
  { code: "ur", name: "Urdu" },
];

export default function LanguagePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading languages…</p>}>
      <LanguageScreen />
    </Suspense>
  );
}

async function LanguageScreen() {
  const { language } = await readOnboarding();
  const copy = authCopy(language);
  const result = await portalCall<unknown>("/languages", { auth: false });
  const languages = asList<NamedRecord>(result.ok ? result.data : [])
    .map((item) => ({
      code: String(item.code ?? item.id ?? ""),
      name: String(item.nativeName ?? item.name ?? item.code ?? "Language"),
    }))
    .filter((item) => item.code);
  return (
    <AuthFrame step={{ label: formatStep(copy.step, 1, 4), current: 1, total: 4 }} title={copy.languageTitle} lede={copy.languageLede} copy={copy}>
      <LanguageForm languages={languages.length ? languages : fallback} selected={language} copy={copy} />
    </AuthFrame>
  );
}
