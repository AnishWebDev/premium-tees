import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/site-url";

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const base = getSiteUrl();

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      cookie,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Admin API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
