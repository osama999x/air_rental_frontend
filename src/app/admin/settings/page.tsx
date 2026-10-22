import type { Metadata } from "next";
import { Suspense } from "react";
import { adminCall } from "@/features/admin/api";
import { Notice, PageIntro, PanelSkeleton, RecordCard, RecordList } from "@/features/admin/components/data-table";
import { SettingForm } from "@/features/admin/components/settings-form";
import { formatValue, formatWhen } from "@/features/admin/format";
import type { PlatformSettingRow } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <SettingsPanel />
    </Suspense>
  );
}

async function SettingsPanel() {
  const result = await adminCall<PlatformSettingRow[]>("/settings");
  if (!result.ok) return <Notice message={result.message} />;

  return (
    <>
      <PageIntro
        title="Settings"
        description="Platform settings. Numbers and true or false are stored as those types."
        meta={`${result.data.length} keys`}
      />
      <article className="admin-card mb-4 p-5">
        <h2 className="mb-3 text-base font-semibold text-navy">Add or replace a setting</h2>
        <SettingForm />
      </article>
      <RecordList count={result.data.length} empty="No settings yet. Add one above.">
        {result.data.map((setting) => (
          <RecordCard key={setting.key} eyebrow={formatWhen(setting.updatedAt)} title={setting.key}>
            <div className="sm:col-span-2 lg:col-span-3">
              <SettingForm settingKey={setting.key} value={formatValue(setting.value)} />
            </div>
          </RecordCard>
        ))}
      </RecordList>
    </>
  );
}
