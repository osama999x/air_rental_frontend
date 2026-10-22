import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Notice, PanelSkeleton, StatTile } from "@/features/admin/components/data-table";
import type { DashboardMetrics } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Dashboard",
};

const spotlight = [
  { key: "activeOwners", label: "Owners" },
  { key: "activeTenants", label: "Tenants" },
  { key: "properties", label: "Properties" },
] as const;

const rest = [
  { key: "managers", label: "Managers" },
  { key: "activeTenancies", label: "Active tenancies" },
  { key: "activeSubscriptions", label: "Active subscriptions" },
  { key: "pendingJobs", label: "Pending jobs" },
  { key: "overdueIntegrationJobs", label: "Dead jobs" },
  { key: "platformErrors", label: "Platform errors" },
] as const;

export default function DashboardPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <DashboardPanel />
    </Suspense>
  );
}

async function DashboardPanel() {
  const result = await adminCall<DashboardMetrics>("/dashboard");
  if (!result.ok) return <Notice message={result.message} />;
  const data = result.data;

  return (
    <div className="grid gap-4">
      <article className="admin-card p-5 sm:p-6">
        <p className="text-sm text-muted">Platform snapshot</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-navy">{data.totalUsers}</p>
        <p className="text-sm font-medium">Total users</p>
        <p className="mt-1 max-w-md text-xs leading-5 text-muted">{data.definitions.totalUsers}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {spotlight.map((item) => (
            <div key={item.key} className="rounded-2xl bg-[#f4f7fb] px-3 py-3 text-center">
              <p className="text-xl font-semibold text-navy">{data[item.key]}</p>
              <p className="text-xs text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </article>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">Needs attention</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {rest
            .filter((item) => ["pendingJobs", "overdueIntegrationJobs", "platformErrors"].includes(item.key))
            .map((item) => (
              <StatTile key={item.key} label={item.label} value={data[item.key]} hint={data.definitions[item.key]} />
            ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy">Operations</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rest
            .filter((item) => !["pendingJobs", "overdueIntegrationJobs", "platformErrors"].includes(item.key))
            .map((item) => (
              <StatTile key={item.key} label={item.label} value={data[item.key]} hint={data.definitions[item.key]} />
            ))}
        </div>
      </section>
    </div>
  );
}
