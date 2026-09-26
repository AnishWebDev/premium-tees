import { proxySiteFaviconResponse } from "@/lib/site-branding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return proxySiteFaviconResponse();
}
