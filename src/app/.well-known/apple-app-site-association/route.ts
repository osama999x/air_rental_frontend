import { NextResponse } from "next/server";

const teamId = process.env.APPLE_TEAM_ID || "TEAMID";

const body = {
  applinks: {
    details: [
      {
        appIDs: [`${teamId}.com.air.air_rental`],
        components: [{ "/": "/portal/invite/*" }],
      },
    ],
  },
};

export function GET() {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
