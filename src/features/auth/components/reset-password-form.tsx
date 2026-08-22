"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordValues } from "../schema/auth.schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: ResetPasswordValues) => {
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated");
      router.push("/dashboard");
    });
  };

  if (!ready) {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>This reset link is invalid or has expired.</p>
        <p>Request a new one from the sign-in page.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </motion.div>
  );
}
