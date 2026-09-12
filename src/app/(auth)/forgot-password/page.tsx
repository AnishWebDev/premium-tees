import { Suspense } from "react";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-neutral-50" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
