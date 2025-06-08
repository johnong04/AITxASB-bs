import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI following latest docs
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

// Get the model - using gemini-1.5-flash for better performance
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const searchCompanies = async (query, companies) => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.warn("Gemini API key not configured, falling back to basic search");
    return basicSearch(query, companies);
  }

  try {
    // Create a simplified company list for Gemini analysis
    const companyList = companies.map((company, index) => ({
      index: index,
      company_name: company.company_name,
      sector: company.sector,
      description: company.description?.substring(0, 200) + "...", // Limit description length
    }));

    const prompt = `
You are an intelligent search assistant for Malaysian Social Enterprises.

SEARCH QUERY: "${query}"

COMPANIES TO ANALYZE:
${JSON.stringify(companyList, null, 2)}

TASK: Analyze the search query and return ONLY the indices (numbers) of companies that best match the search intent.

MATCHING CRITERIA:
- Company name relevance
- Sector alignment
- Description keywords
- Business focus areas
- Innovation aspects

RESPONSE FORMAT: Return ONLY a JSON array of numbers (indices), ranked by relevance.
Example: [0, 5, 12, 3]
Maximum 10 results.

IMPORTANT: Return ONLY the JSON array, no other text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini search response:", text);

    // Clean and parse the response
    const cleanedText = text.replace(/```json|```|```/g, "").trim();
    const matchingIndices = JSON.parse(cleanedText);

    // Filter companies by matching indices
    const filteredCompanies = matchingIndices
      .filter((index) => index >= 0 && index < companies.length)
      .map((index) => companies[index]);

    console.log(`Gemini found ${filteredCompanies.length} matching companies`);
    return filteredCompanies;
  } catch (error) {
    console.error("Error with Gemini search:", error);
    console.log("Falling back to basic search");
    return basicSearch(query, companies);
  }
};

export const generateSummary = async (companies, searchTerm = "") => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return generateBasicSummary(companies, searchTerm);
  }

  try {
    const sectorsData = companies.reduce((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1;
      return acc;
    }, {});

    // Create detailed company summaries for grant analysis
    const companyDetails = companies.slice(0, 15).map((company) => ({
      name: company.company_name,
      sector: company.sector,
      description: company.description?.substring(0, 300),
      website: company.website_url,
      email: company.email,
      status: company.social_enterprise_status,
      programs: company.program_participation,
      impact: company.related_news_updates,
    }));

    const prompt = `
You are an expert analyst preparing a comprehensive grant funding report for Malaysian Social Enterprises.

ANALYSIS SCOPE:
- Search Query: "${searchTerm}"
- Total Organizations: ${companies.length}
- Sector Distribution: ${JSON.stringify(sectorsData)}

DETAILED COMPANY PROFILES:
${JSON.stringify(companyDetails, null, 2)}

REPORT AUDIENCE: Grant providers, impact investors, and funding organizations

GENERATE A COMPREHENSIVE GRANT-FOCUSED REPORT with these sections:

# Executive Summary for Grant Providers
[2-3 paragraph overview highlighting funding opportunities and impact potential]

# Sector Analysis & Grant Opportunities
[Detailed breakdown by sector with specific funding recommendations]

# High-Impact Organizations Profile
[Spotlight 3-5 most promising organizations for grants, including:]
- Organization name and focus
- Demonstrated impact and metrics
- Funding readiness assessment
- Specific grant alignment opportunities

# Market Intelligence
[Current trends, gaps, and emerging opportunities in Malaysian social enterprise ecosystem]

# Strategic Grant Allocation Recommendations
[Specific recommendations for grant distribution, amounts, and focus areas]

# Risk Assessment & Due Diligence Notes
[Key considerations for grant providers]

# Collaboration & Partnership Opportunities
[Cross-sector collaboration potential and ecosystem development]

FORMAT: Use clear markdown with bullet points, specific metrics where available, and actionable insights for grant decision-making.

TONE: Professional, data-driven, optimistic but realistic about challenges and opportunities.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedReport = response.text();

    console.log("Gemini generated comprehensive grant report");
    return generatedReport;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return generateBasicSummary(companies, searchTerm);
  }
};

export const generateChartData = async (companies) => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return generateBasicChartData(companies);
  }

  try {
    const sectorsData = companies.reduce((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1;
      return acc;
    }, {});

    const totalCompanies = companies.length;
    const uniqueSectors = Object.keys(sectorsData).length;

    const prompt = `
DATASET: Malaysian Social Enterprises Sector Analysis
Total Organizations: ${totalCompanies}
Sectors: ${uniqueSectors}
Distribution: ${JSON.stringify(sectorsData)}

TASK: Generate optimized chart data for data visualization dashboards.

REQUIREMENTS:
1. Create sector distribution data for bar/pie charts
2. Suggest the best visualization type for this data
3. Include funding readiness metrics if patterns are evident
4. Add growth potential indicators

RESPONSE FORMAT (JSON only):
{
  "sectorDistribution": [
    {"sector": "Technology", "count": 5, "percentage": 33.3, "funding_readiness": "High"},
    {"sector": "Environment", "count": 3, "percentage": 20.0, "funding_readiness": "Medium"}
  ],
  "chartSuggestion": {
    "type": "pie",
    "title": "Malaysian Social Enterprise Ecosystem - Sector Distribution",
    "description": "Breakdown of social enterprises by primary sector focus",
    "insights": ["Key insight 1", "Key insight 2"]
  },
  "fundingMetrics": {
    "high_readiness": 8,
    "medium_readiness": 5,
    "emerging": 2
  }
}

Return ONLY valid JSON, no markdown formatting.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini chart generation response:", text);

    const cleanedText = text.replace(/```json|```|```/g, "").trim();
    const chartData = JSON.parse(cleanedText);

    return chartData;
  } catch (error) {
    console.error("Error generating chart data:", error);
    return generateBasicChartData(companies);
  }
};

// Fallback functions when Gemini is not available
const basicSearch = (query, companies) => {
  const searchTerms = query.toLowerCase().split(" ");
  return companies.filter((company) => {
    const searchText =
      `${company.company_name} ${company.sector} ${company.description}`.toLowerCase();
    return searchTerms.some((term) => searchText.includes(term));
  });
};

const generateBasicSummary = (companies, searchTerm) => {
  const totalCompanies = companies.length;
  const sectors = [...new Set(companies.map((c) => c.sector))];
  const topSectors = Object.entries(
    companies.reduce(
      (acc, c) => ({ ...acc, [c.sector]: (acc[c.sector] || 0) + 1 }),
      {}
    )
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const featuredCompanies = companies.slice(0, 5);

  return `
# Grant Provider Analysis Report

## Executive Summary
Analysis of ${totalCompanies} Malaysian social enterprises${
    searchTerm ? ` matching "${searchTerm}"` : ""
  } reveals a diverse ecosystem with significant funding opportunities.

## Sector Distribution & Grant Opportunities
- **Total Active Sectors**: ${sectors.length}
- **Primary Focus Areas**: ${topSectors
    .map(([sector, count]) => `${sector} (${count} organizations)`)
    .join(", ")}

## High-Impact Organizations Profile

${featuredCompanies
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
- **High Priority**: ${
    topSectors[0]?.[0] || "Technology"
  } sector shows strong ecosystem development
- **Emerging Opportunities**: Cross-sector collaboration initiatives
- **Risk Mitigation**: Focus on organizations with verified social enterprise status

## Market Intelligence
- Diverse ecosystem spanning ${sectors.length} different sectors
- Strong representation in ${topSectors[0]?.[0] || "various sectors"}
- Growing momentum in sustainable development initiatives

## Next Steps for Grant Providers
1. Conduct detailed due diligence on featured organizations
2. Consider sector-specific funding rounds
3. Explore partnership opportunities for maximum impact
4. Establish metrics for social impact measurement
`;
};

const generateBasicChartData = (companies) => {
  const sectorCounts = companies.reduce((acc, company) => {
    acc[company.sector] = (acc[company.sector] || 0) + 1;
    return acc;
  }, {});

  const totalCompanies = companies.length;
  const sectorDistribution = Object.entries(sectorCounts).map(
    ([sector, count]) => ({
      sector: sector.length > 15 ? sector.substring(0, 15) + "..." : sector,
      count,
      percentage: ((count / totalCompanies) * 100).toFixed(1),
      funding_readiness:
        count >= 3 ? "High" : count >= 2 ? "Medium" : "Emerging",
    })
  );

  return {
    sectorDistribution,
    chartSuggestion: {
      type: "pie",
      title: "Malaysian Social Enterprise Ecosystem - Sector Distribution",
      description:
        "Comprehensive breakdown of social enterprises by primary sector focus",
      insights: [
        `${Object.keys(sectorCounts).length} distinct sectors represented`,
        `${totalCompanies} total organizations analyzed`,
        `${
          sectorDistribution.filter((s) => s.funding_readiness === "High")
            .length
        } sectors show high funding readiness`,
      ],
    },
    fundingMetrics: {
      high_readiness: sectorDistribution
        .filter((s) => s.funding_readiness === "High")
        .reduce((sum, s) => sum + s.count, 0),
      medium_readiness: sectorDistribution
        .filter((s) => s.funding_readiness === "Medium")
        .reduce((sum, s) => sum + s.count, 0),
      emerging: sectorDistribution
        .filter((s) => s.funding_readiness === "Emerging")
        .reduce((sum, s) => sum + s.count, 0),
    },
  };
};
