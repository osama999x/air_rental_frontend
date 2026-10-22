import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, PanelSkeleton, RecordCard, RecordList, StatusChip } from "@/features/admin/components/data-table";
import { formatWhen, prettyLabel } from "@/features/admin/format";
import type { ProviderRow } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Providers",
};

export default function ProvidersPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <ProvidersPanel />
    </Suspense>
  );
}

async function ProvidersPanel() {
  const result = await adminCall<ProviderRow[]>("/providers");
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro
        title="Providers"
        description="Utility providers, how they connect, and the last success or error."
        meta={`${result.data.length} providers`}
      />
      <RecordList count={result.data.length} empty="No providers yet.">
        {result.data.map((provider) => (
          <RecordCard
            key={provider.id}
            eyebrow={provider.code}
            title={provider.name}
            chip={<StatusChip value={provider.enabled} />}
          >
            <Field label="Category" value={prettyLabel(provider.category)} />
            <Field label="Capability" value={prettyLabel(provider.capability)} />
            <Field label="Country" value={provider.countryIso2 || "—"} />
            <Field label="Retry policy" value={provider.retryPolicy || "—"} />
            <Field label="Auth" value={provider.authRequirements || "—"} />
            <Field label="Last success" value={formatWhen(provider.lastSuccessAt)} />
            <Field label="Last error" value={provider.lastError || "—"} />
          </RecordCard>
        ))}
      </RecordList>
    </>
  );
}
