import { Suspense } from "react";
import { getCmsBlock } from "@/lib/cms-content";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const authCopy = await getCmsBlock("auth");

  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl bg-[var(--muted)]" aria-hidden />
      }
    >
      <LoginForm title={authCopy.loginTitle} subtitle={authCopy.loginSubtitle} />
    </Suspense>
  );
}
