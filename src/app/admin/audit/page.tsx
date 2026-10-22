import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, Pagination, PanelSkeleton, RecordCard, RecordList, StatusChip } from "@/features/admin/components/data-table";
import { formatWhen, pageCount, prettyLabel, readPage, shortId } from "@/features/admin/format";
import type { AuditLogRow, PageResult } from "@/features/admin/types";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Audit",
};

export default function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AuditPanel searchParams={searchParams} />
    </Suspense>
  );
}

async function AuditPanel({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = readPage(readParam((await searchParams).page));
  const result = await adminCall<PageResult<AuditLogRow>>(`/audit-logs?page=${page}`);
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro title="Audit" description="Newest platform actions first." meta={`${result.data.total} events`} />
      <RecordList count={result.data.items.length} empty="No audit events.">
        {result.data.items.map((entry) => (
          <RecordCard
            key={entry.id}
            eyebrow={formatWhen(entry.createdAt)}
            title={entry.action}
            chip={<StatusChip value={entry.outcome} />}
          >
            <Field label="Entity" value={`${prettyLabel(entry.entityType)} · ${entry.entityId}`} />
            <Field label="Actor" value={prettyLabel(entry.actorType)} />
            <Field label="Role" value={entry.activeRole ? prettyLabel(entry.activeRole) : "—"} />
            <Field label="Admin" value={<span title={entry.actorAdminId || undefined}>{shortId(entry.actorAdminId)}</span>} />
            <Field label="User" value={<span title={entry.actorUserId || undefined}>{shortId(entry.actorUserId)}</span>} />
            <Field label="Property" value={<span title={entry.propertyId || undefined}>{shortId(entry.propertyId)}</span>} />
            <Field label="Tenancy" value={<span title={entry.tenancyId || undefined}>{shortId(entry.tenancyId)}</span>} />
            <Field label="IP" value={entry.ipAddress || "—"} />
            <Field label="Request" value={entry.requestId || "—"} />
            <Field label="Details" value={entry.metadata ? JSON.stringify(entry.metadata) : "—"} />
          </RecordCard>
        ))}
      </RecordList>
      <Pagination
        page={result.data.page}
        pages={pageCount(result.data.total, result.data.pageSize)}
        hrefFor={(nextPage) => `/admin/audit?page=${nextPage}`}
      />
    </>
  );
}
