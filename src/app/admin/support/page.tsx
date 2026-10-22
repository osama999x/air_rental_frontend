import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, PanelSkeleton, RecordCard, RecordList, StatusChip } from "@/features/admin/components/data-table";
import { formatWhen, prettyLabel, shortId } from "@/features/admin/format";
import type { SupportTicketRow } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Support",
};

export default function SupportPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <SupportPanel />
    </Suspense>
  );
}

async function SupportPanel() {
  const result = await adminCall<SupportTicketRow[]>("/support");
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro
        title="Support"
        description="The latest 100 tickets. Replies and status changes are not available on this API."
        meta={`${result.data.length} shown`}
      />
      <RecordList count={result.data.length} empty="No support tickets.">
        {result.data.map((ticket) => (
          <RecordCard key={ticket.id} eyebrow={prettyLabel(ticket.priority)} title={ticket.subject} chip={<StatusChip value={ticket.status} />}>
            <Field label="Message" value={ticket.body} />
            <Field label="Opened" value={formatWhen(ticket.createdAt)} />
            <Field label="User" value={<span title={ticket.userId || undefined}>{shortId(ticket.userId)}</span>} />
          </RecordCard>
        ))}
      </RecordList>
    </>
  );
}
