import type { Metadata } from "next";
import { Suspense } from "react";
import { asList, portalCall } from "@/features/portal/api";
import { EmptyState, Notice, PageTitle, RecordLink, Screen } from "@/features/portal/components/ui";
import type { NamedRecord } from "@/features/portal/types";

export const instant = false;

export const metadata: Metadata = { title: "Activity" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading activity…</p>}>
      <ActivityPanel />
    </Suspense>
  );
}

async function ActivityPanel() {
  const properties = await portalCall<unknown>("/properties");
  const rows = asList<NamedRecord>(properties.ok ? properties.data : []);
  const property = rows[0];
  const activity = property ? await portalCall<unknown>(`/activity?propertyId=${property.id}`) : null;
  const events = asList<NamedRecord>(activity && activity.ok ? activity.data : []);
  return (
    <Screen>
      <PageTitle kicker="AUDIT" title="Activity log" />
      <p className="mb-4 text-sm leading-6 text-muted">Events for a property cannot be edited or deleted.</p>
      {!properties.ok ? <Notice message={properties.message} /> : null}
      {activity && !activity.ok ? <Notice message={activity.message} /> : null}
      {!property ? <EmptyState title="No property yet" body="Activity is kept per property." href="/portal/properties/new" label="Add property" /> : null}
      {property ? <p className="mb-3 text-sm font-medium text-navy">{String(property.visibleCode ?? "")} {String(property.name ?? "")}</p> : null}
      <ul className="grid gap-2">
        {events.map((event) => (
          <li key={event.id}>
            <RecordLink
              href="/portal/activity"
              mark={String(event.action ?? "A")}
              title={String(event.action ?? "Event")}
              subtitle={String(event.entityType ?? event.createdAt ?? "")}
              status={event.outcome ? String(event.outcome) : undefined}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
