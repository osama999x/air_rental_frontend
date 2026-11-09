import { NextResponse } from "next/server";

const body = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.air.air_rental",
      sha256_cert_fingerprints: [
        "E1:33:66:FC:8D:0E:30:8E:94:73:55:0A:AB:2B:5D:78:61:28:88:B1:16:2F:A8:CC:CD:77:34:2C:E0:15:8F:D5",
      ],
    },
  },
];

export function GET() {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
