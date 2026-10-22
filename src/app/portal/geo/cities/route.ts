const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export async function GET(request: Request) {
  const countryId = new URL(request.url).searchParams.get("countryId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(countryId)) {
    return Response.json({ data: [] });
  }
  const response = await fetch(`${API_URL}/countries/${countryId}/cities`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({ data: [] }));
  return Response.json(payload, { status: response.ok ? 200 : response.status });
}
