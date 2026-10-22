import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { PanelSkeleton } from "@/features/admin/components/data-table";
import { readAdminProfile } from "@/features/admin/session";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="admin-shell min-h-full flex-1 p-6">
          <PanelSkeleton />
        </div>
      }
    >
      <AdminChrome>{children}</AdminChrome>
    </Suspense>
  );
}

async function AdminChrome({ children }: { children: ReactNode }) {
  const profile = await readAdminProfile();
  if (!profile) return children;
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
