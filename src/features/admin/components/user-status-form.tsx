"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateUserStatus } from "@/features/admin/actions";
import type { FormState, UserStatus } from "@/features/admin/types";
import { userStatuses } from "@/features/admin/types";

const initialState: FormState = { status: "idle", message: "" };

export function UserStatusForm({ id, status }: { id: string; status: UserStatus }) {
  const [state, action, pending] = useActionState(updateUserStatus, initialState);

  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="h-11 rounded-2xl border border-line bg-[#f4f7fb] px-3 text-sm"
      >
        {userStatuses.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        name="reason"
        required
        minLength={3}
        placeholder="Reason"
        className="h-11 rounded-2xl border border-line bg-[#f4f7fb] px-3 text-sm"
      />
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? "Saving…" : "Update status"}
      </Button>
      {state.message ? (
        <p className={`text-xs ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
