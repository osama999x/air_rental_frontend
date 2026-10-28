import { redirect } from "next/navigation";
import { readAccessToken, readPortalProfile } from "@/features/portal/session";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";
const allowed =
  /^(documents\/[0-9a-f-]{36}\/download|maintenance\/attachments\/[0-9a-f-]{36}\/download|bills\/proofs\/[0-9a-f-]{36}\/download|properties\/media\/[0-9a-f-]{36}\/download)$/i;

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const token = await readAccessToken();
  const profile = await readPortalProfile();
  if (!token || !profile) redirect("/portal/login");
  const path = (await context.params).path.join("/");
  if (!allowed.test(path)) return new Response("Unknown file.", { status: 404 });

  let response: Response;
  try {
    response = await fetch(`${API_URL}/${path}`, {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
        "X-Portal-Role": profile.activeRole,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return new Response("The file took too long to load.", { status: 504 });
  }
  const bytes = await response.arrayBuffer();
  if (!response.ok || bytes.byteLength === 0) {
    return new Response("Photo unavailable.", { status: response.ok ? 404 : response.status });
  }
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
