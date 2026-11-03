import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = { fullName: string; businessName: string | null };

// Same switch as the proxy: mock data while Supabase is not set up.
const UI_PREVIEW =
  process.env.NODE_ENV === "development" && process.env.UI_PREVIEW === "1";

// The logged-in nutritionist's names for the dashboard header. Cached per
// request, since the header reads it twice.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (UI_PREVIEW) return { fullName: "Sol Oyola", businessName: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("nutritionists")
    .select("full_name, business_name")
    .eq("id", user.id)
    .single();

  return {
    fullName: data?.full_name ?? "",
    businessName: data?.business_name ?? null,
  };
});

// Business name when there is one, otherwise the person's name.
export function displayName(profile: Profile | null) {
  return profile?.businessName?.trim() || profile?.fullName.trim() || "Mi consultorio";
}
