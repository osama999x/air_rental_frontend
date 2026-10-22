import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, PanelSkeleton, RecordCard, RecordList, StatTile, StatusChip } from "@/features/admin/components/data-table";
import { formatWhen } from "@/features/admin/format";
import type { IntegrationsSnapshot } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Integrations",
};

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <IntegrationsPanel />
    </Suspense>
  );
}

async function IntegrationsPanel() {
  const result = await adminCall<IntegrationsSnapshot>("/integrations");
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro title="Integrations" description="Scheduled jobs and the latest failed integration executions." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <StatTile label="Pending jobs" value={result.data.jobs.pending} hint="Jobs waiting to run." />
        <StatTile label="Dead jobs" value={result.data.jobs.dead} hint="Jobs that exhausted their retries." />
      </div>
      <h2 className="mb-3 text-lg font-semibold text-navy">Failed executions</h2>
      <RecordList count={result.data.failures.length} empty="No failed executions.">
        {result.data.failures.map((failure) => (
          <RecordCard
            key={failure.id}
            eyebrow={failure.integrationCode}
            title={failure.operation}
            chip={<StatusChip value={failure.status} />}
          >
            <Field label="Error" value={failure.errorMessage || "—"} />
            <Field label="Started" value={formatWhen(failure.createdAt)} />
            <Field label="Finished" value={formatWhen(failure.finishedAt)} />
          </RecordCard>
        ))}
      </RecordList>
    </>
  );
}
