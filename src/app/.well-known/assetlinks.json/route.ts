import { NextResponse } from "next/server";

const body = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.air.air_rental",
      sha256_cert_fingerprints: [
        "E1:33:66:FC:8D:0E:30:8E:94:73:55:0A:AB:2B:5D:78:61:28:88:B1:16:2F:A8:CC:CD:77:34:2C:E0:15:8F:D5",
        "E8:A2:1E:04:33:9D:D5:E8:69:55:F1:DC:62:47:D6:0C:CB:C9:2B:7E:7E:8E:03:CB:AE:AF:5B:68:D0:F4:B3:D4",
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
