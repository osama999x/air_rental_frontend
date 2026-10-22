import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Field, Notice, PageIntro, Pagination, PanelSkeleton, RecordCard, RecordList, SearchBar, StatusChip } from "@/features/admin/components/data-table";
import { UserStatusForm } from "@/features/admin/components/user-status-form";
import { formatWhen, pageCount, prettyLabel, readPage, yesNo } from "@/features/admin/format";
import type { AdminUser, PageResult } from "@/features/admin/types";
import { readParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[]; page?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <UsersPanel searchParams={searchParams} />
    </Suspense>
  );
}

async function UsersPanel({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const search = readParam(params.search)?.trim() ?? "";
  const page = readPage(readParam(params.page));
  const query = new URLSearchParams({ page: String(page) });
  if (search) query.set("search", search);
  const result = await adminCall<PageResult<AdminUser>>(`/users?${query.toString()}`);
  if (!result.ok) return <Notice message={result.message} />;

  const hrefFor = (nextPage: number) => {
    const next = new URLSearchParams({ page: String(nextPage) });
    if (search) next.set("search", search);
    return `/admin/users?${next.toString()}`;
  };

  return (
    <>
      <PageIntro
        title="Users"
        description="Search by email or first name. Suspending or deactivating an account revokes its sessions."
        meta={`${result.data.total} accounts`}
      />
      <SearchBar action="/admin/users" defaultValue={search} placeholder="Search email or first name" />
      <RecordList count={result.data.items.length} empty={search ? "No users match this search." : "No users yet."}>
        {result.data.items.map((user) => (
          <RecordCard
            key={user.id}
            eyebrow={user.email}
            title={`${user.firstName} ${user.lastName}`}
            chip={<StatusChip value={user.status} />}
            action={<UserStatusForm id={user.id} status={user.status} />}
          >
            <Field label="Phone" value={user.phone || "—"} />
            <Field label="Role" value={user.preferredPortalRole ? prettyLabel(user.preferredPortalRole) : "—"} />
            <Field label="Language" value={user.preferredLanguage || "—"} />
            <Field label="Timezone" value={user.timezone || "—"} />
            <Field label="Email verified" value={user.emailVerifiedAt ? formatWhen(user.emailVerifiedAt) : "No"} />
            <Field label="Phone verified" value={user.phoneVerifiedAt ? formatWhen(user.phoneVerifiedAt) : "No"} />
            <Field label="MFA" value={yesNo(user.mfaEnabled)} />
            <Field label="Joined" value={formatWhen(user.createdAt)} />
          </RecordCard>
        ))}
      </RecordList>
      <Pagination page={result.data.page} pages={pageCount(result.data.total, result.data.pageSize)} hrefFor={hrefFor} />
    </>
  );
}
