import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

// Get the model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const searchCompanies = async (query, companies) => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.warn("Gemini API key not configured, falling back to basic search");
    return basicSearch(query, companies);
  }

  try {
    const prompt = `
Given the search query: "${query}"
And the following companies data:
${JSON.stringify(companies.slice(0, 20))} // Limit for token constraints

Analyze the query and return ONLY a JSON array of company IDs that best match the search intent, ranked by relevance.
Consider company name, sector, description, and related keywords.
Maximum 10 results.

Example format: ["uuid1", "uuid2", "uuid3"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    const cleanedText = text.replace(/```json|```/g, "").trim();
    const matchingIds = JSON.parse(cleanedText);

    // Filter companies by matching IDs
    return companies.filter((company) => matchingIds.includes(company.id));
  } catch (error) {
    console.error("Error with Gemini search:", error);
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

    const prompt = `
Analyze the following social enterprises data and provide insights:

Search Term: "${searchTerm}"
Total Companies: ${companies.length}
Sectors Distribution: ${JSON.stringify(sectorsData)}

Companies:
${companies
  .slice(0, 10)
  .map(
    (c) =>
      `- ${c.company_name} (${c.sector}): ${c.description?.substring(
        0,
        100
      )}...`
  )
  .join("\n")}

Generate a comprehensive analysis covering:
1. **Executive Summary** - Key findings and overview
2. **Sector Analysis** - Distribution and trends
3. **Innovation Highlights** - Notable companies and approaches
4. **Market Opportunities** - Potential collaboration areas
5. **Recommendations** - Strategic suggestions

Format as markdown with clear sections and bullet points.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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

    const prompt = `
Based on this social enterprises sector data:
${JSON.stringify(sectorsData)}

Generate a JavaScript object for chart visualization that includes:
1. Basic sector distribution (bar chart data)
2. A more creative visualization suggestion

Return ONLY valid JSON in this format:
{
  "sectorDistribution": [{"sector": "name", "count": number}],
  "chartSuggestion": {"type": "pie|bar|line", "title": "title", "description": "description"}
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
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

  return `
# Analysis Summary

## Executive Summary
Found ${totalCompanies} social enterprises${
    searchTerm ? ` matching "${searchTerm}"` : ""
  }.

## Sector Distribution
- **Total Sectors**: ${sectors.length}
- **Top Sectors**: ${topSectors
    .map(([sector, count]) => `${sector} (${count})`)
    .join(", ")}

## Key Insights
- Diverse ecosystem spanning ${sectors.length} different sectors
- Strong representation in ${topSectors[0]?.[0] || "various sectors"}
- Opportunities for cross-sector collaboration

## Recommendations
- Consider partnerships between complementary sectors
- Explore knowledge sharing initiatives
- Investigate collaborative funding opportunities
`;
};

const generateBasicChartData = (companies) => {
  const sectorCounts = companies.reduce((acc, company) => {
    acc[company.sector] = (acc[company.sector] || 0) + 1;
    return acc;
  }, {});

  return {
    sectorDistribution: Object.entries(sectorCounts).map(([sector, count]) => ({
      sector: sector.length > 15 ? sector.substring(0, 15) + "..." : sector,
      count,
    })),
    chartSuggestion: {
      type: "bar",
      title: "Sector Distribution",
      description: "Distribution of social enterprises by sector",
    },
  };
};
