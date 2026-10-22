"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateSetting } from "@/features/admin/actions";
import type { FormState } from "@/features/admin/types";

const initialState: FormState = { status: "idle", message: "" };

export function SettingForm({
  settingKey = "",
  value = "",
}: {
  settingKey?: string;
  value?: string;
}) {
  const [state, action, pending] = useActionState(updateSetting, initialState);

  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="grid gap-1 text-xs font-medium text-muted">
        Key
        <input
          name="key"
          defaultValue={settingKey}
          required
          readOnly={Boolean(settingKey)}
          className="h-11 rounded-2xl border border-line bg-[#f4f7fb] px-3 text-sm text-foreground read-only:bg-foreground/5"
        />
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted">
        Value
        <input
          name="value"
          defaultValue={value}
          required
          className="h-11 rounded-2xl border border-line bg-[#f4f7fb] px-3 text-sm text-foreground"
        />
      </label>
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.message ? (
        <p className={`text-xs sm:col-span-3 ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
