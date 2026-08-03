import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.fullName ?? (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "there",
    avatarUrl: profile?.avatarUrl ?? (user.user_metadata?.avatar_url as string | undefined) ?? null,
  };
});
