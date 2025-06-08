"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { generateSummary } from "@/src/services/gemini";

export default function SummaryPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    try {
      const stored = localStorage.getItem("asbhive-summary");
      if (stored) {
        const data = JSON.parse(stored);
        setSummaryData(data);

        // Simulate AI summary generation
        await generateAISummary(data);
      }
    } catch (error) {
      console.error("Error loading summary data:", error);
    } finally {
      setLoading(false);
    }
  };
  const generateAISummary = async (data) => {
    try {
      console.log("🤖 Generating AI-powered grant provider report...");
      const { companies, searchTerm } = data;

      // Use Gemini to generate comprehensive grant provider report
      const aiGeneratedSummary = await generateSummary(companies, searchTerm);

      console.log("✅ AI report generated successfully");
      setAiSummary(aiGeneratedSummary);
    } catch (error) {
      console.error("Error generating AI summary:", error);

      // Fallback to basic summary if Gemini fails
      const { companies, searchTerm } = data;
      const sectors = [...new Set(companies.map((c) => c.sector))];
      const totalCompanies = companies.length;

      const fallbackSummary = `# Grant Provider Analysis Report

## Executive Summary
Analysis of ${totalCompanies} Malaysian social enterprises${
        searchTerm ? ` matching "${searchTerm}"` : ""
      } reveals significant funding opportunities across ${
        sectors.length
      } sectors.

## Sector Distribution & Grant Opportunities
${sectors
  .map((sector) => {
    const sectorCompanies = companies.filter((c) => c.sector === sector);
    return `• **${sector}**: ${sectorCompanies.length} ${
      sectorCompanies.length === 1 ? "organization" : "organizations"
    } - ${sectorCompanies.map((c) => c.company_name).join(", ")}`;
  })
  .join("\n")}

## High-Impact Organizations Profile
${companies
  .slice(0, 5)
  .map(
    (company) => `
### ${company.company_name}
- **Sector**: ${company.sector}
- **Impact Focus**: ${company.description?.substring(0, 150)}...
- **Grant Readiness**: ${
      company.social_enterprise_status === "Yes"
        ? "Verified Social Enterprise"
        : "Emerging Organization"
    }
${company.website_url ? `- **Website**: ${company.website_url}` : ""}
`
  )
  .join("")}

## Strategic Grant Allocation Recommendations
- **High Priority**: Focus on verified social enterprises with demonstrated impact
- **Emerging Opportunities**: Support cross-sector collaboration initiatives
- **Risk Mitigation**: Prioritize organizations with clear social enterprise status

## Market Intelligence
- Diverse ecosystem spanning ${sectors.length} different sectors
- Strong representation in ${sectors[0] || "various sectors"}
- Growing momentum in sustainable development initiatives

## Next Steps for Grant Providers
1. Conduct detailed due diligence on featured organizations
2. Consider sector-specific funding rounds
3. Explore partnership opportunities for maximum impact
4. Establish metrics for social impact measurement`;

      setAiSummary(fallbackSummary);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Generating AI-powered grant provider report...
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Using Gemini AI to analyze social enterprises
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Summary Available
              </h2>
              <p className="text-gray-600 mb-6">
                Please perform a search first to generate a summary of
                companies.
              </p>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Summary Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AI-Generated Summary
          </h1>
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
            <Badge variant="outline">
              {summaryData.companies.length} Companies Analyzed
            </Badge>
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
                <CardDescription>
                  Generated by Gemini AI based on your search results
                </CardDescription>
              </CardHeader>{" "}
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {aiSummary.split("\n").map((paragraph, index) => {
                    // Handle markdown headers
                    if (paragraph.startsWith("# ")) {
                      return (
                        <h1
                          key={index}
                          className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b border-gray-200 pb-2"
                        >
                          {paragraph.replace("# ", "")}
                        </h1>
                      );
                    } else if (paragraph.startsWith("## ")) {
                      return (
                        <h2
                          key={index}
                          className="text-xl font-semibold text-gray-800 mt-6 mb-3"
                        >
                          {paragraph.replace("## ", "")}
                        </h2>
                      );
                    } else if (paragraph.startsWith("### ")) {
                      return (
                        <h3
                          key={index}
                          className="text-lg font-medium text-gray-800 mt-4 mb-2"
                        >
                          {paragraph.replace("### ", "")}
                        </h3>
                      );
                    }
                    // Handle markdown bold formatting
                    else if (
                      paragraph.startsWith("**") &&
                      paragraph.endsWith("**")
                    ) {
                      return (
                        <h3
                          key={index}
                          className="text-lg font-semibold text-gray-800 mt-6 mb-3"
                        >
                          {paragraph.replace(/\*\*/g, "")}
                        </h3>
                      );
                    }
                    // Handle bullet points with bold headers
                    else if (paragraph.match(/^[•-] \*\*.*\*\*:/)) {
                      const content = paragraph.replace(
                        /^[•-] \*\*(.*)\*\*: (.*)/,
                        "$1: $2"
                      );
                      const [title, ...rest] = content.split(": ");
                      return (
                        <div key={index} className="mb-2 ml-4">
                          <strong className="text-gray-800">{title}:</strong>{" "}
                          {rest.join(": ")}
                        </div>
                      );
                    }
                    // Handle regular bullet points
                    else if (paragraph.match(/^[•-] /)) {
                      return (
                        <div key={index} className="mb-2 ml-4 text-gray-700">
                          {paragraph.replace(/^[•-] /, "• ")}
                        </div>
                      );
                    }
                    // Handle numbered lists
                    else if (paragraph.match(/^\d+\./)) {
                      return (
                        <div key={index} className="mb-2 ml-4 text-gray-700">
                          {paragraph}
                        </div>
                      );
                    }
                    // Handle regular paragraphs
                    else if (paragraph.trim()) {
                      return (
                        <p
                          key={index}
                          className="mb-4 text-gray-700 leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-gray-800">
                  Analyzed Companies
                </CardTitle>
                <CardDescription>
                  Companies included in this summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summaryData.companies.map((company) => (
                    <div
                      key={company.id}
                      className="border-l-4 border-l-red-500 pl-4"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {company.company_name}
                      </h4>
                      <p className="text-sm text-gray-600">{company.sector}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {company.contact_info}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
