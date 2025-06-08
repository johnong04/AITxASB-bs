"use client";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables (client-side safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getUserCompany = async (email) => {
  try {
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return company;
  } catch (error) {
    console.error("Error getting user company:", error);
    return null;
  }
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    console.log("No user found, redirecting to auth...");
    window.location.href = "/auth";
    return null;
  }
  console.log("User authenticated:", user.email);
  return user;
};

// Check if user is authenticated without redirecting
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};
