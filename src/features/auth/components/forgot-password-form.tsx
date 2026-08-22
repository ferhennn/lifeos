"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schema/auth.schema";
import { requestPasswordReset } from "../actions/auth.actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (values: ForgotPasswordValues) => {
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setSent(true);
    });
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center"
      >
        <MailCheck className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      </motion.div>
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
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </motion.div>
  );
}
