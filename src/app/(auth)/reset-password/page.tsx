import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password — LifeOS" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="This replaces your current password." footer={null}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
