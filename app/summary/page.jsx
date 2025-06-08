"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, FileText, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"

export default function SummaryPage() {
  const [summaryData, setSummaryData] = useState(null)
  const [aiSummary, setAiSummary] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummaryData()
  }, [])

  const loadSummaryData = async () => {
    try {
      const stored = localStorage.getItem("asbhive-summary")
      if (stored) {
        const data = JSON.parse(stored)
        setSummaryData(data)

        // Simulate AI summary generation
        await generateAISummary(data)
      }
    } catch (error) {
      console.error("Error loading summary data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateAISummary = async (data) => {
    // Simulate Gemini AI API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const { companies, searchTerm } = data
    const sectors = [...new Set(companies.map((c) => c.sector))]
    const totalCompanies = companies.length

    const summary = `Based on your search${searchTerm ? ` for "${searchTerm}"` : ""}, I found ${totalCompanies} social enterprises across ${sectors.length} sectors.

**Key Insights:**

• **Sector Diversity**: The companies span ${sectors.join(", ")}, showing a diverse ecosystem of social impact initiatives.

• **Geographic Reach**: These enterprises are making impact across Southeast Asia, with presence in major cities like Kuala Lumpur, Bangkok, and Manila.

• **Impact Focus**: The organizations demonstrate strong commitment to addressing critical social challenges including environmental sustainability, healthcare access, and educational equity.

**Sector Analysis:**
${sectors
  .map((sector) => {
    const sectorCompanies = companies.filter((c) => c.sector === sector)
    return `• **${sector}**: ${sectorCompanies.length} ${sectorCompanies.length === 1 ? "company" : "companies"} - ${sectorCompanies.map((c) => c.company_name).join(", ")}`
  })
  .join("\n")}

**Recommendations:**
• Consider partnerships between complementary sectors for greater impact
• Explore opportunities for knowledge sharing and best practices exchange
• Investigate potential for collaborative funding or resource sharing initiatives

This ecosystem represents a strong foundation for social innovation in the region, with opportunities for enhanced collaboration and impact scaling.`

    setAiSummary(summary)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI summary...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Summary Available</h2>
              <p className="text-gray-600 mb-6">Please perform a search first to generate a summary of companies.</p>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <a href="/">
                  <Search className="mr-2 h-4 w-4" />
                  Go to Search
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="outline" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Summary Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI-Generated Summary</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(summaryData.timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <Badge variant="outline">{summaryData.companies.length} Companies Analyzed</Badge>
            {summaryData.searchTerm && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Search: "{summaryData.searchTerm}"
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <FileText className="mr-2 h-5 w-5 text-red-600" />
                  AI Analysis & Insights
                </CardTitle>
                <CardDescription>Generated by Gemini AI based on your search results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {aiSummary.split("\n").map((paragraph, index) => {
                    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                      return (
                        <h3 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                          {paragraph.replace(/\*\*/g, "")}
                        </h3>
                      )
                    } else if (paragraph.startsWith("• **")) {
                      const [title, ...content] = paragraph.replace("• **", "").split("**: ")
                      return (
                        <div key={index} className="mb-2">
                          <strong className="text-gray-800">{title}:</strong> {content.join(": ")}
                        </div>
                      )
                    } else if (paragraph.startsWith("• ")) {
                      return (
                        <div key={index} className="mb-2 ml-4">
                          {paragraph.replace("• ", "• ")}
                        </div>
                      )
                    } else if (paragraph.trim()) {
                      return (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-gray-800">Analyzed Companies</CardTitle>
                <CardDescription>Companies included in this summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summaryData.companies.map((company) => (
                    <div key={company.id} className="border-l-4 border-l-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800">{company.company_name}</h4>
                      <p className="text-sm text-gray-600">{company.sector}</p>
                      <p className="text-sm text-gray-500 mt-1">{company.contact_info}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
