"use client"

import { useState, useEffect } from "react"
import { Building, Globe, FileText, Tag, Mail, Phone, Save, ArrowLeft, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/components/navigation"
import { getCurrentUser, getUserCompany, supabase } from "@/lib/auth"

const sectors = [
  "Environmental Technology",
  "Healthcare",
  "Education",
  "Financial Inclusion",
  "Agriculture",
  "Clean Energy",
  "Social Innovation",
  "Community Development",
  "Digital Inclusion",
  "Sustainable Fashion",
  "Food Security",
  "Water & Sanitation",
]

const socialEnterpriseStatuses = ["Verified", "Certified", "Pending Verification", "Under Review"]

export default function EditCompanyPage() {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    website_url: "",
    sector: "",
    description: "",
    contact_info: "",
    social_enterprise_status: "Verified",
    related_news_updates: "",
    program_participation: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const checkUserAndLoadCompany = async () => {
      try {
        console.log("Edit page: Checking authentication...")

        // Check if user is authenticated
        const currentUser = await getCurrentUser()

        if (!currentUser) {
          console.log("Edit page: No user found, redirecting to auth...")
          window.location.href = "/auth"
          return
        }

        console.log("Edit page: User authenticated:", currentUser.email)
        setUser(currentUser)

        // Fetch company data
        const company = await getUserCompany(currentUser.email)

        if (!company) {
          console.log("Edit page: No company data found")
          setError("Company data not found. Please contact support.")
          return
        }

        console.log("Edit page: Company data loaded:", company.company_name)
        setFormData({
          company_name: company.company_name || "",
          email: company.email || "",
          website_url: company.website_url || "",
          sector: company.sector || "",
          description: company.description || "",
          contact_info: company.contact_info || "",
          social_enterprise_status: company.social_enterprise_status || "Verified",
          related_news_updates: company.related_news_updates || "",
          program_participation: company.program_participation || "",
        })
      } catch (error) {
        console.error("Edit page: Error loading company data:", error)
        setError("Error loading company data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    checkUserAndLoadCompany()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Updating company data for:", user.email)

      // Update company data
      const { error } = await supabase
        .from("companies")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("email", user.email)

      if (error) throw error

      console.log("Company data updated successfully")
      setSuccess("Company information updated successfully!")
      window.scrollTo(0, 0)
    } catch (error) {
      console.error("Error updating company:", error)
      setError("An error occurred while updating your company information. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading company information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Company Information</h1>
              <p className="text-gray-600">Update your company details in the ASBhive ecosystem</p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/auth")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Building className="mr-2 h-5 w-5 text-red-600" />
                Company Information
              </CardTitle>
              <CardDescription>Update your social enterprise details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Company Name *
                    </Label>
                    <Input
                      id="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email *
                    </Label>
                    <Input id="email" type="email" value={formData.email} disabled className="bg-gray-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      Website URL
                    </Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => handleInputChange("website_url", e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector" className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      Sector *
                    </Label>
                    <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your company's mission, activities, and impact..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_info" className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Information
                    </Label>
                    <Textarea
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => handleInputChange("contact_info", e.target.value)}
                      placeholder="Phone: +60 12 345 6789, Address: City, Country"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_enterprise_status">Social Enterprise Status</Label>
                    <Select
                      value={formData.social_enterprise_status}
                      onValueChange={(value) => handleInputChange("social_enterprise_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {socialEnterpriseStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program_participation">Program Participation</Label>
                  <Textarea
                    id="program_participation"
                    value={formData.program_participation}
                    onChange={(e) => handleInputChange("program_participation", e.target.value)}
                    placeholder="List any programs, accelerators, or networks you're part of..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="related_news_updates">Recent News & Updates</Label>
                  <Textarea
                    id="related_news_updates"
                    value={formData.related_news_updates}
                    onChange={(e) => handleInputChange("related_news_updates", e.target.value)}
                    placeholder="Share recent achievements, news, or updates about your company..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={saving || !formData.company_name || !formData.sector || !formData.description}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={() => (window.location.href = "/auth")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
