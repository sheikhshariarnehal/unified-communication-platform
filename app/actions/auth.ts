"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect(redirectTo);
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const company = (formData.get("company") as string)?.trim() || "My Company";

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // If user is auto-confirmed, sign in immediately
  if (data.user) {
    const loginRes = await supabase.auth.signInWithPassword({ email, password });
    if (!loginRes.error) {
      redirect("/");
    }
  }

  return {
    success: true,
    redirectTo: "/login?message=Account+created+successfully.+Please+sign+in.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
