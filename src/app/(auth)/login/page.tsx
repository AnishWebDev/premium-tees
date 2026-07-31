import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-50" />}>
      <LoginForm />
    </Suspense>
  );
}
