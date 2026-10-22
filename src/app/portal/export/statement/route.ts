import { redirect } from "next/navigation";
import { readAccessToken, readPortalProfile } from "@/features/portal/session";

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export async function GET(request: Request) {
  const token = await readAccessToken();
  const profile = await readPortalProfile();
  if (!token || !profile) redirect("/portal/login");

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const format = url.searchParams.get("format") ?? "csv";
  if (!from || !to) return new Response("Choose a from and to date.", { status: 400 });

  const response = await fetch(
    `${API_URL}/rent/statements?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&format=${encodeURIComponent(format)}`,
    {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
        "X-Portal-Role": profile.activeRole,
      },
      cache: "no-store",
    },
  );
  const body = await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition":
        response.headers.get("content-disposition") ?? `attachment; filename="rent-statement.${format}"`,
    },
  });
}
