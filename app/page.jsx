"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navigation from "@/components/navigation";
import {
  supabase,
  fetchCompanies as fetchCompaniesService,
} from "@/src/services/supabase";
import { searchCompanies, generateChartData } from "@/src/services/gemini";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      } else {
        setFilteredCompanies(companies);
        updateChartData(companies);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, companies]);

  const performSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      updateChartData(companies);
      return;
    }

    setSearching(true);
    try {
      console.log(`🔍 Performing Gemini search for: "${searchTerm}"`);
      const searchResults = await searchCompanies(searchTerm, companies);
      console.log(`✅ Found ${searchResults.length} matching companies`);

      setFilteredCompanies(searchResults);
      updateChartData(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to basic search
      const basicResults = companies.filter(
        (company) =>
          company.company_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          company.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(basicResults);
      updateChartData(basicResults);
    } finally {
      setSearching(false);
    }
  };

  const updateChartData = async (companiesList) => {
    try {
      const chartResult = await generateChartData(companiesList);
      if (chartResult && chartResult.sectorDistribution) {
        setChartData(chartResult.sectorDistribution);
      } else {
        // Fallback chart data
        const sectorCounts = {};
        companiesList.forEach((company) => {
          sectorCounts[company.sector] =
            (sectorCounts[company.sector] || 0) + 1;
        });

        const fallbackData = Object.entries(sectorCounts).map(
          ([sector, count]) => ({
            sector:
              sector.length > 15 ? sector.substring(0, 15) + "..." : sector,
            count,
          })
        );
        setChartData(fallbackData);
      }
    } catch (error) {
      console.error("Chart generation error:", error);
      // Basic fallback
      const sectorCounts = {};
      companiesList.forEach((company) => {
        sectorCounts[company.sector] = (sectorCounts[company.sector] || 0) + 1;
      });

      const fallbackData = Object.entries(sectorCounts).map(
        ([sector, count]) => ({
          sector: sector.length > 15 ? sector.substring(0, 15) + "..." : sector,
          count,
        })
      );
      setChartData(fallbackData);
    }
  };

  const fetchCompanies = async () => {
    try {
      console.log("Fetching companies from Supabase...");

      // Test the connection first
      const { data: testData, error: testError } = await supabase
        .from("companies")
        .select("count", { count: "exact" });

      console.log("Connection test:", { testData, testError });

      // Use the service layer function first
      const data = await fetchCompaniesService();

      if (data && data.length > 0) {
        console.log(
          "✅ Fetched companies from service:",
          data.length,
          "companies"
        );
        setCompanies(data);
        setFilteredCompanies(data);
        setLoading(false);
        return;
      }

      // Fall back to direct query if service fails
      console.log("Service layer returned empty, trying direct query...");
      const { data: directData, error } = await supabase.from("companies")
        .select(`
          id,
          company_name,
          email,
          website_url,
          sector,
          description,
          contact_info,
          social_enterprise_status,
          related_news_updates,
          program_participation
        `);

      if (error) {
        console.error("❌ Supabase error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      }

      if (directData && directData.length > 0) {
        console.log(
          "✅ Fetched companies (direct):",
          directData.length,
          "companies"
        );
        setCompanies(directData);
        setFilteredCompanies(directData);
        setLoading(false);
        return;
      } else {
        console.log("❌ No data returned from direct query");
      }

      // Fall back to mock data if no data
      console.log("Using mock data...");
      const mockData = [
        {
          id: 1,
          company_name: "EcoTech Solutions",
          sector: "Environmental Technology",
          description:
            "Developing sustainable technology solutions for waste management and renewable energy. Our innovative approach combines IoT sensors with AI analytics to optimize waste collection routes and reduce carbon emissions.",
          website_url: "https://ecotech-solutions.com",
          contact_info:
            "Phone: +60 3 2123 4567, Address: Kuala Lumpur, Malaysia",
          social_enterprise_status: "Certified",
          related_news_updates: "Recently won the Green Innovation Award 2024.",
          program_participation: "ASB Accelerator Program 2023",
        },
        {
          id: 2,
          company_name: "HealthBridge",
          sector: "Healthcare",
          description:
            "Connecting rural communities with healthcare services through telemedicine platforms. We provide remote consultations, health monitoring, and medical supply delivery to underserved areas.",
          website_url: "https://healthbridge.asia",
          contact_info: "Phone: +66 2 123 4567, Address: Bangkok, Thailand",
          social_enterprise_status: "Verified",
          related_news_updates: "Expanded to 5 new provinces in Thailand.",
          program_participation: "ASEAN Social Enterprise Network",
        },
        {
          id: 3,
          company_name: "EduEmpower",
          sector: "Education",
          description:
            "Providing digital literacy programs for underserved communities across Southeast Asia. Our mobile learning labs bring technology education directly to rural schools and community centers.",
          website_url: "https://eduempower.org",
          contact_info: "Phone: +63 2 8123 4567, Address: Manila, Philippines",
          social_enterprise_status: "Certified",
          related_news_updates: "Launched new AI-powered learning platform.",
          program_participation: "UNESCO Education Program",
        },
      ];

      setCompanies(mockData);
      setFilteredCompanies(mockData);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    try {
      console.log(
        `📊 Generating grant provider report for ${filteredCompanies.length} companies`
      );

      const summaryData = {
        companies: filteredCompanies,
        searchTerm,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("asbhive-summary", JSON.stringify(summaryData));
      window.location.href = "/summary";
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {" "}
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  searching ? "text-red-600 animate-pulse" : "text-gray-400"
                }`}
              />
              <Input
                type="text"
                placeholder="Search for social enterprises by name, sector, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 h-12 text-lg border-2 transition-colors ${
                  searching
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-red-500"
                }`}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                </div>
              )}
            </div>
            <Button
              onClick={generateSummary}
              disabled={generating || filteredCompanies.length === 0}
              className="bg-red-600 hover:bg-red-700 h-12 px-6"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              {searching ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                  Using AI to search for "{searchTerm}"...
                </span>
              ) : (
                <span>
                  {filteredCompanies.length > 0
                    ? `Found ${filteredCompanies.length} companies matching "${searchTerm}"`
                    : `No companies found for "${searchTerm}"`}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Companies List */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Social Enterprises
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredCompanies.length} found)
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              {filteredCompanies.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <p className="text-gray-500 text-lg">
                      No companies found matching your search.
                    </p>
                    <p className="text-gray-400 mt-2">
                      Try adjusting your search terms or browse all companies.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredCompanies.map((company) => (
                  <Card
                    key={company.id}
                    className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-800">
                            {company.company_name}
                          </CardTitle>
                          <CardDescription className="text-gray-600 mt-1">
                            {company.contact_info}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800"
                          >
                            {company.sector}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              company.social_enterprise_status === "Certified"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {company.social_enterprise_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">
                        {company.description}
                      </p>

                      {company.program_participation && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">
                            Program Participation:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {company.program_participation}
                          </p>
                        </div>
                      )}

                      {company.related_news_updates && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">
                            Recent Updates:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {company.related_news_updates}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 font-medium hover:underline"
                        >
                          Visit Website →
                        </a>
                        {company.email && (
                          <a
                            href={`mailto:${company.email}`}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Contact: {company.email}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <TrendingUp className="mr-2 h-5 w-5 text-red-600" />
                  Sector Distribution
                </CardTitle>
                <CardDescription>
                  Companies by sector in current search
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="sector"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No data to display</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
