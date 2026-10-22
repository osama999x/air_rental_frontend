import { PanelSkeleton } from "@/features/admin/components/data-table";

export default function AdminLoading() {
  return (
    <div className="admin-shell min-h-full flex-1 p-6">
      <PanelSkeleton />
    </div>
  );
}
