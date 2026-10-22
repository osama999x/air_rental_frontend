import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, Pagination, PanelSkeleton, RecordCard, RecordList, StatusChip } from "@/features/admin/components/data-table";
import { formatWhen, pageCount, propertyTypeLabel, readPage, shortId } from "@/features/admin/format";
import type { PageResult, PropertyRow } from "@/features/admin/types";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Properties",
};

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PropertiesPanel searchParams={searchParams} />
    </Suspense>
  );
}

async function PropertiesPanel({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = readPage(readParam((await searchParams).page));
  const result = await adminCall<PageResult<PropertyRow>>(`/properties?page=${page}`);
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro
        title="Properties"
        description="Every property on the platform, including archived rows."
        meta={`${result.data.total} properties`}
      />
      <RecordList count={result.data.items.length} empty="No properties yet.">
        {result.data.items.map((property) => (
          <RecordCard
            key={property.id}
            eyebrow={property.visibleCode}
            title={property.name}
            chip={<StatusChip value={property.status} />}
          >
            <Field label="Type" value={propertyTypeLabel(property.propertyType)} />
            <Field label="Owner" value={<span title={property.ownerUserId || undefined}>{shortId(property.ownerUserId)}</span>} />
            <Field label="City" value={<span title={property.cityId || undefined}>{shortId(property.cityId)}</span>} />
            <Field label="Country" value={<span title={property.countryId || undefined}>{shortId(property.countryId)}</span>} />
            <Field label="Created" value={formatWhen(property.createdAt)} />
          </RecordCard>
        ))}
      </RecordList>
      <Pagination
        page={result.data.page}
        pages={pageCount(result.data.total, result.data.pageSize)}
        hrefFor={(nextPage) => `/admin/properties?page=${nextPage}`}
      />
    </>
  );
}
