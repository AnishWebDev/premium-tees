import { NextResponse } from "next/server";
import { commerceFromSettings } from "@/lib/commerce";
import { getStoreSettings } from "@/lib/store-settings";

export async function GET() {
  try {
    const settings = await getStoreSettings();

    return NextResponse.json({
      commerce: commerceFromSettings(settings),
      announcement: settings.announcement,
    });
  } catch (error) {
    console.error("[GET /api/store/config]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
