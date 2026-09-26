import { noStoreHeaders } from "@/lib/catalog-api";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { headers: noStoreHeaders });
}