import { Suspense } from "react";
import { getCmsBlock } from "@/lib/cms-content";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const authCopy = await getCmsBlock("auth");

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-50" />}>
      <LoginForm title={authCopy.loginTitle} subtitle={authCopy.loginSubtitle} />
    </Suspense>
  );
}
