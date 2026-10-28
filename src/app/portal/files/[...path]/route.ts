import { readAccessToken, readPortalProfile } from "@/features/portal/session";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";
const allowed =
  /^(documents\/[0-9a-f-]{36}\/download|maintenance\/attachments\/[0-9a-f-]{36}\/download|bills\/proofs\/[0-9a-f-]{36}\/download|properties\/media\/[0-9a-f-]{36}\/download|users\/me\/avatar)$/i;

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const token = await readAccessToken();
  const profile = await readPortalProfile();
  if (!token || !profile) return new Response("Sign in required.", { status: 401 });
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
  let bytes: Buffer;
  try {
    bytes = Buffer.from(await response.arrayBuffer());
  } catch {
    return new Response("The file took too long to load.", { status: 504 });
  }
  const type = mediaType(bytes, response.headers.get("content-type"));
  if (!response.ok || bytes.byteLength === 0 || type.startsWith("text/") || type.includes("json")) {
    return new Response("Photo unavailable.", { status: response.ok ? 404 : response.status || 404 });
  }
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": "inline",
      "Cache-Control": path === "users/me/avatar" ? "private, no-cache" : "private, max-age=86400",
    },
  });
}

function mediaType(bytes: Buffer, header: string | null) {
  const declared = (header || "").split(";")[0].trim().toLowerCase();
  if (declared && declared !== "application/octet-stream") return declared;
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length > 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.length > 4 && bytes.subarray(0, 4).toString("ascii") === "%PDF") return "application/pdf";
  return declared || "application/octet-stream";
}
