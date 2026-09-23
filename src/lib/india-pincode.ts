import { INDIA_STATE_OPTIONS, OTHER_STATE } from "@/lib/india-locations";

type PincodeApiResponse = {
  Status?: string;
  Message?: string;
  PostOffice?: { State?: string; District?: string }[] | null;
};

function normalizeRegionName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function validateIndiaPincode(
  pin: string,
  shippingState: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!/^\d{6}$/.test(pin)) {
    return { ok: false, message: "Enter a valid 6-digit PIN code" };
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        message: "Could not verify PIN code. Check the number and try again.",
      };
    }

    const data = (await res.json()) as PincodeApiResponse[];
    const entry = data[0];
    if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
      return { ok: false, message: "This PIN code is not valid for India" };
    }

    if (
      shippingState === OTHER_STATE ||
      !INDIA_STATE_OPTIONS.includes(shippingState)
    ) {
      return { ok: true };
    }

    const apiState = entry.PostOffice[0]?.State?.trim() ?? "";
    if (
      apiState &&
      normalizeRegionName(apiState) !== normalizeRegionName(shippingState)
    ) {
      return {
        ok: false,
        message: `PIN ${pin} is in ${apiState}, not ${shippingState}. Update PIN or state.`,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Could not verify PIN code right now. Try again in a moment.",
    };
  }
}
