import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, Pagination, PanelSkeleton, RecordCard, RecordList } from "@/features/admin/components/data-table";
import { formatWhen, pageCount, readPage, shortId } from "@/features/admin/format";
import type { OrganizationRow, PageResult } from "@/features/admin/types";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Organizations",
};

export default function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <OrganizationsPanel searchParams={searchParams} />
    </Suspense>
  );
}

async function OrganizationsPanel({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = readPage(readParam((await searchParams).page));
  const result = await adminCall<PageResult<OrganizationRow>>(`/organizations?page=${page}`);
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro
        title="Organizations"
        description="Owner organizations. Contact, address, and creator are read-only."
        meta={`${result.data.total} organizations`}
      />
      <RecordList count={result.data.items.length} empty="No organizations yet.">
        {result.data.items.map((organization) => (
          <RecordCard key={organization.id} eyebrow={organization.organizationType || "Organization"} title={organization.name}>
            <Field label="Email" value={organization.email || "—"} />
            <Field label="Phone" value={organization.phone || "—"} />
            <Field label="Address" value={organization.addressLine || "—"} />
            <Field label="City" value={<span title={organization.cityId || undefined}>{shortId(organization.cityId)}</span>} />
            <Field label="Country" value={<span title={organization.countryId || undefined}>{shortId(organization.countryId)}</span>} />
            <Field label="Created by" value={<span title={organization.createdByUserId || undefined}>{shortId(organization.createdByUserId)}</span>} />
            <Field label="Created" value={formatWhen(organization.createdAt)} />
          </RecordCard>
        ))}
      </RecordList>
      <Pagination
        page={result.data.page}
        pages={pageCount(result.data.total, result.data.pageSize)}
        hrefFor={(nextPage) => `/admin/organizations?page=${nextPage}`}
      />
    </>
  );
}
