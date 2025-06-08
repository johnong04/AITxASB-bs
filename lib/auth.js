"use client"

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qwctgyifztfnnkzsaidf.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Y3RneWlmenRmbm5renNhaWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTQ1OTYsImV4cCI6MjA2NDkzMDU5Nn0.xMv0OtLHiKmwXAOGUd4JtpfeL2iYjCBviHzpq-jK5nc"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helper functions
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const getUserCompany = async (email) => {
  try {
    const { data: company, error } = await supabase.from("companies").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return company
  } catch (error) {
    console.error("Error getting user company:", error)
    return null
  }
}

export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) {
    console.log("No user found, redirecting to auth...")
    window.location.href = "/auth"
    return null
  }
  console.log("User authenticated:", user.email)
  return user
}

// Check if user is authenticated without redirecting
export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}
