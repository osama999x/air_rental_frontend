import { redirect } from "next/navigation";
import { readAccessToken } from "./session";
import type { AdminResult } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

type CallOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  auth?: boolean;
};

export async function adminCall<T>(path: string, options: CallOptions = {}): Promise<AdminResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const token = await readAccessToken();
    if (!token) redirect("/admin/login");
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/admin${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "The admin API is unreachable. Start the API on port 3000, or set API_URL.",
    };
  }

  const payload = await readPayload(response);
  if (response.status === 401 && options.auth !== false) {
    redirect("/admin/session/end");
  }
  if (!response.ok) {
    return { ok: false, status: response.status, message: messageFrom(payload) };
  }

  return { ok: true, data: (payload.data ?? payload) as T };
}

async function readPayload(response: Response): Promise<{ message?: unknown; data?: unknown }> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as { message?: unknown; data?: unknown };
  } catch {
    return { message: "The admin API returned an unreadable response." };
  }
}

function messageFrom(payload: { message?: unknown }) {
  if (Array.isArray(payload.message)) return payload.message.map(String).join(" ");
  if (typeof payload.message === "string" && payload.message) return payload.message;
  return "The admin API rejected the request.";
}
