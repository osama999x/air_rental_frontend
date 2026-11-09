import { SkeletonList } from "@/components/motion/primitives";

export default function PortalLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-8 pb-24 sm:px-6" role="status">
      <p className="text-sm text-muted">Loading…</p>
      <div className="mt-4">
        <SkeletonList />
      </div>
    </div>
  );
}
