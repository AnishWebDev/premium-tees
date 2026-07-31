import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-50" />}>
      <RegisterForm />
    </Suspense>
  );
}
