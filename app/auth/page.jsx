"use client"

import { useState, useEffect } from "react"
import { Mail, Lock, Building, ArrowRight, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/components/navigation"
import { getCurrentUser, getUserCompany, supabase } from "@/lib/auth"

// Authentication flow states
const AUTH_STATES = {
  EMAIL_CHECK: "EMAIL_CHECK",
  CREATE_PASSWORD: "CREATE_PASSWORD",
  LOGIN: "LOGIN",
  REGISTER: "REGISTER",
  PROFILE: "PROFILE",
}

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [authState, setAuthState] = useState(AUTH_STATES.EMAIL_CHECK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [user, setUser] = useState(null)
  const [companyData, setCompanyData] = useState(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          console.log("User already logged in:", currentUser.email)
          setUser(currentUser)
          const company = await getUserCompany(currentUser.email)
          if (company) {
            setCompanyData(company)
            setAuthState(AUTH_STATES.PROFILE)
          }
        }
      } catch (error) {
        console.error("Error checking user:", error)
      }
    }

    checkUser()
  }, [])

  // Handle email check
  const handleEmailCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Checking email:", email)

      // Check if email exists in companies table
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("email", email)
        .single()

      if (companyError && companyError.code !== "PGRST116") {
        throw companyError
      }

      if (company) {
        console.log("Company found:", company.company_name)
        setCompanyData(company)
        setCompanyName(company.company_name)

        // Check if user has already set up authentication
        const hasAuthSetup = company.password_hash && company.password_hash !== "" && company.password_hash !== null

        if (hasAuthSetup) {
          console.log("User has auth setup, showing login")
          setSuccess(`Welcome back, ${company.company_name}! Please enter your password to log in.`)
          setAuthState(AUTH_STATES.LOGIN)
        } else {
          console.log("User needs to create password")
          setSuccess(`Welcome back, ${company.company_name}! Please create a password to access your account.`)
          setAuthState(AUTH_STATES.CREATE_PASSWORD)
        }
      } else {
        console.log("Company not found, showing register")
        setSuccess("Email not found. Let's register your company!")
        setAuthState(AUTH_STATES.REGISTER)
      }
    } catch (error) {
      console.error("Error checking email:", error)
      setError("An error occurred while checking your email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle create password
  const handleCreatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      console.log("Creating password for:", email)

      // Create auth user with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_id: companyData.id,
            company_name: companyData.company_name,
          },
        },
      })

      if (error) {
        // If user already exists, try to sign them in instead
        if (error.message?.includes("User already registered")) {
          console.log("User already exists, trying to sign in")
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) throw signInError

          setUser(signInData.user)
          setSuccess("Logged in successfully!")
        } else {
          throw error
        }
      } else {
        console.log("User created successfully")
        setUser(data.user)
        setSuccess("Password created successfully! You are now logged in.")
      }

      // Update company record with password_hash indicator
      await supabase
        .from("companies")
        .update({
          password_hash: "password_set",
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyData.id)

      setAuthState(AUTH_STATES.PROFILE)

      // Small delay to ensure auth state is set, then redirect
      setTimeout(() => {
        console.log("Redirecting to edit page...")
        window.location.href = "/edit"
      }, 1000)
    } catch (error) {
      console.error("Error creating password:", error)
      if (error.message?.includes("User already registered")) {
        setError("An account with this email already exists. Please try logging in instead.")
        setAuthState(AUTH_STATES.LOGIN)
      } else {
        setError("An error occurred while creating your password. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Logging in user:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message?.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else {
          throw error
        }
        return
      }

      console.log("Login successful")
      setSuccess("Logged in successfully!")
      setUser(data.user)
      setAuthState(AUTH_STATES.PROFILE)

      // Small delay to ensure auth state is set, then redirect
      setTimeout(() => {
        console.log("Redirecting to edit page...")
        window.location.href = "/edit"
      }, 1000)
    } catch (error) {
      console.error("Error logging in:", error)
      setError("An error occurred while logging in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      console.log("Registering new user:", email)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
          },
        },
      })

      if (authError) throw authError

      // Create company record
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            company_name: companyName,
            email,
            password_hash: "password_set",
            social_enterprise_status: "Pending Verification",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (companyError) throw companyError

      console.log("Registration successful")
      setSuccess("Registration successful! You are now logged in.")
      setUser(authData.user)
      setCompanyData(companyData[0])
      setAuthState(AUTH_STATES.PROFILE)

      // Small delay to ensure auth state is set, then redirect
      setTimeout(() => {
        console.log("Redirecting to edit page...")
        window.location.href = "/edit"
      }, 1000)
    } catch (error) {
      console.error("Error registering:", error)
      setError("An error occurred during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setCompanyData(null)
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setCompanyName("")
      setAuthState(AUTH_STATES.EMAIL_CHECK)
    } catch (error) {
      console.error("Error logging out:", error)
      setError("An error occurred while logging out. Please try again.")
    }
  }

  // Handle edit company button click
  const handleEditCompany = () => {
    console.log("Edit company button clicked, user:", user?.email)
    if (user) {
      window.location.href = "/edit"
    } else {
      setError("Please log in first to edit your company information.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Email Check Form */}
          {authState === AUTH_STATES.EMAIL_CHECK && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to ASBhive</CardTitle>
                <CardDescription>Enter your company email to get started</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleEmailCheck} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Company Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="company@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Create Password Form */}
          {authState === AUTH_STATES.CREATE_PASSWORD && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create Password</CardTitle>
                <CardDescription>Set a password for {companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleCreatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input id="email" type="email" value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Create Password & Login"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setAuthState(AUTH_STATES.EMAIL_CHECK)
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Back to Email Check
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Login Form */}
          {authState === AUTH_STATES.LOGIN && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Welcome back, {companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input id="email" type="email" value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setAuthState(AUTH_STATES.EMAIL_CHECK)
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Back to Email Check
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Register Form */}
          {authState === AUTH_STATES.REGISTER && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Register Your Company</CardTitle>
                <CardDescription>Create an account to join ASBhive</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input id="email" type="email" value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setAuthState(AUTH_STATES.EMAIL_CHECK)
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Back to Email Check
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Profile View */}
          {authState === AUTH_STATES.PROFILE && user && companyData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Company Profile</CardTitle>
                <CardDescription>Welcome, {companyData.company_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <p className="text-gray-700 font-medium">{companyData.company_name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-gray-700">{companyData.email}</p>
                </div>
                {companyData.sector && (
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <p className="text-gray-700">{companyData.sector}</p>
                  </div>
                )}
                <div className="pt-4 flex flex-col gap-3">
                  <Button onClick={handleEditCompany} className="bg-red-600 hover:bg-red-700">
                    Edit Company Information
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
