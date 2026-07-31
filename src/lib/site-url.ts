/** Resolves the public site URL without requiring env vars on Vercel. */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL.replace(/\/$/, "");
  }
  // Automatically set by Vercel on every deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
