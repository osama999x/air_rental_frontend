export function UnitGridSkeleton() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="skeleton h-64 rounded-3xl" />
      ))}
    </div>
  );
}
