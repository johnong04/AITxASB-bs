"use client"

import { useState, useEffect } from "react"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getUserCompany, supabase } from "@/lib/auth"

export default function Navigation() {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const userCompany = await getUserCompany(currentUser.email)
          setCompany(userCompany)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        const userCompany = await getUserCompany(session.user.email)
        setCompany(userCompany)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setCompany(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCompany(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ASBhive</h1>
            <p className="text-red-100">Ecosystem Hub</p>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="/" className="hover:text-red-200">
              Search
            </a>
            <a href="/summary" className="hover:text-red-200">
              Summary
            </a>

            {user ? (
              <>
                <a href="/edit" className="hover:text-red-200">
                  Edit Company
                </a>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{company?.company_name || user.email.split("@")[0]}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:text-red-200 hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <a href="/auth" className="hover:text-red-200">
                Login / Register
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
