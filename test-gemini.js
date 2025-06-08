// Test script to verify Gemini API integration
const {
  searchCompanies,
  generateSummary,
} = require("./src/services/gemini.js");

// Sample test companies (matching our real data structure)
const testCompanies = [
  {
    company_name: "Biji-biji Initiative",
    email: "collaborate@biji-biji.com",
    website_url: "https://www.biji-biji.com/",
    sector: "Environment",
    description:
      "Driving Sustainable Development through Technology & Education. We build and strengthen the ecosystem for sustainable development through enabling changemakers and impact leaders with access to knowledge and innovative solutions.",
    social_enterprise_status: "Yes",
  },
  {
    company_name: "Wild Asia",
    email: "",
    website_url: "https://www.wildasia.org/",
    sector: "Environment",
    description:
      "Creating Innovative Solutions, from the Ground Up. Wild Asia focuses on environmental conservation and sustainable development across Asia.",
    social_enterprise_status: "Yes",
  },
];

async function testGeminiIntegration() {
  console.log("🧪 Testing Gemini API Integration...\n");

  try {
    // Test 1: Search functionality
    console.log("1️⃣ Testing Smart Search...");
    const searchResults = await searchCompanies(
      "environmental sustainability",
      testCompanies
    );
    console.log(`✅ Search returned ${searchResults.length} results`);
    console.log(
      "Found companies:",
      searchResults.map((c) => c.company_name)
    );

    // Test 2: Summary generation
    console.log("\n2️⃣ Testing Summary Generation...");
    const summary = await generateSummary(
      searchResults,
      "environmental sustainability"
    );
    console.log(`✅ Summary generated (${summary.length} characters)`);
    console.log("Summary preview:", summary.substring(0, 200) + "...");

    console.log("\n🎉 All Gemini tests passed!");
  } catch (error) {
    console.error("❌ Gemini test failed:", error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testGeminiIntegration();
}

module.exports = { testGeminiIntegration };
