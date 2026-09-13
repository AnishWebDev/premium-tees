import { Suspense } from "react";
import { getCmsBlock } from "@/lib/cms-content";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const authCopy = await getCmsBlock("auth");

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-50" />}>
      <RegisterForm
        title={authCopy.registerTitle}
        subtitle={authCopy.registerSubtitle}
      />
    </Suspense>
  );
}
