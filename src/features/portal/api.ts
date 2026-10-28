import { redirect } from "next/navigation";
import { readAccessToken, readPortalProfile } from "./session";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export type PortalResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

type CallOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  form?: FormData;
  onUnauthorized?: "refresh" | "return";
};

export async function portalCall<T>(path: string, options: CallOptions = {}): Promise<PortalResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.auth !== false) {
    const token = await readAccessToken();
    if (!token) {
      if (options.onUnauthorized === "return") {
        return { ok: false, status: 401, message: "You are not logged in" };
      }
      redirect("/portal/session/end");
    }
    headers.set("Authorization", `Bearer ${token}`);
    const profile = await readPortalProfile();
    if (profile) headers.set("X-Portal-Role", profile.activeRole);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      ok: false,
      status: 0,
      message: timedOut
        ? "The Air Rental API took too long to answer. Try again."
        : "The Air Rental API is unreachable. Start it on port 3000, or set API_URL.",
    };
  }

  if (response.status === 401 && options.auth !== false) {
    if (options.onUnauthorized === "return") {
      const denied = await readPayload(response);
      return { ok: false, status: 401, message: messageFrom(denied) };
    }
    redirect("/portal/session/end");
  }

  const payload = await readPayload(response);
  if (!response.ok) {
    return { ok: false, status: response.status, message: messageFrom(payload) };
  }
  return { ok: true, data: (payload.data ?? payload) as T };
}

export function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

async function readPayload(response: Response): Promise<{ message?: unknown; data?: unknown }> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as { message?: unknown; data?: unknown };
  } catch {
    return { message: "The API returned an unreadable response." };
  }
}

function messageFrom(payload: { message?: unknown }) {
  if (Array.isArray(payload.message)) return payload.message.map(String).join(" ");
  if (typeof payload.message === "string" && payload.message) return payload.message;
  return "The API rejected the request.";
}
