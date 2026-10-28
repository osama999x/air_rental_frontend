import { cache } from "react";
import { readAccessToken } from "@/features/portal/session";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export const readAvatarDataUrl = cache(async (): Promise<string | null> => {
  const token = await readAccessToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/users/me/avatar`, {
      headers: { Accept: "image/*", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    const type = (response.headers.get("content-type") || "image/jpeg").split(";")[0].trim().toLowerCase();
    if (!bytes.length || !type.startsWith("image/")) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
});
