import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Reset password — LifeOS" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one."
      footer={
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
