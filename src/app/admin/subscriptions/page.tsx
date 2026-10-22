import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, PanelSkeleton, RecordCard, RecordList, StatusChip } from "@/features/admin/components/data-table";
import { formatWhen, shortId, yesNo } from "@/features/admin/format";
import type { SubscriptionRow } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Subscriptions",
};

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <SubscriptionsPanel />
    </Suspense>
  );
}

async function SubscriptionsPanel() {
  const result = await adminCall<SubscriptionRow[]>("/subscriptions");
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro
        title="Subscriptions"
        description="The latest 100 subscriptions. Plan, trial, and billing period are read-only."
        meta={`${result.data.length} shown`}
      />
      <RecordList count={result.data.length} empty="No subscriptions yet.">
        {result.data.map((subscription) => (
          <RecordCard
            key={subscription.id}
            eyebrow={subscription.planCode || "No plan"}
            title={shortId(subscription.accountUserId)}
            chip={<StatusChip value={subscription.status} />}
          >
            <Field label="Account" value={<span title={subscription.accountUserId}>{subscription.accountUserId}</span>} />
            <Field label="Active units" value={String(subscription.activeUnitCount)} />
            <Field label="Trial used" value={yesNo(subscription.trialUsed)} />
            <Field label="Trial started" value={formatWhen(subscription.trialStartedAt)} />
            <Field label="Trial ends" value={formatWhen(subscription.trialEndsAt)} />
            <Field label="Period start" value={formatWhen(subscription.currentPeriodStart)} />
            <Field label="Period end" value={formatWhen(subscription.currentPeriodEnd)} />
            <Field label="Cancels at period end" value={yesNo(subscription.cancelAtPeriodEnd)} />
          </RecordCard>
        ))}
      </RecordList>
    </>
  );
}
