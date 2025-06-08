import { createClient } from "@supabase/supabase-js";

// Environment variables with fallbacks for development
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qwctgyifztfnnkzsaidf.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Y3RneWlmenRmbm5renNhaWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTQ1OTYsImV4cCI6MjA2NDkzMDU5Nn0.xMv0OtLHiKmwXAOGUd4JtpfeL2iYjCBviHzpq-jK5nc";

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database helper functions
export const fetchCompanies = async () => {
  try {
    console.log("🔍 Service: Attempting to fetch companies...");
    console.log("🔗 Supabase URL:", supabaseUrl);
    console.log("🔑 Has Anon Key:", !!supabaseAnonKey);

    const { data, error } = await supabase
      .from("companies")
      .select(
        `
        id,
        company_name,
        email,
        website_url,
        sector,
        description,
        contact_info,
        social_enterprise_status,
        related_news_updates,
        program_participation,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Service: Supabase error:", error);

      // If API key error, return sample data for testing
      if (
        error.message?.includes("Invalid API key") ||
        error.message?.includes("401")
      ) {
        console.warn("🔄 Using sample data due to API key issue");
        return getSampleCompanies();
      }

      throw error;
    }

    console.log(
      "✅ Service: Successfully fetched",
      data?.length || 0,
      "companies"
    );
    return data || [];
  } catch (error) {
    console.error("❌ Service: Error fetching companies:", error);
    // Return sample data on error for testing purposes
    console.warn("🔄 Falling back to sample data");
    return getSampleCompanies();
  }
};

// Sample data for testing when Supabase is not available
const getSampleCompanies = () => {
  return [
    {
      id: 1,
      company_name: "EcoTech Solutions Malaysia",
      email: "contact@ecotech.my",
      website_url: "https://ecotech.my",
      sector: "Environmental Technology",
      description:
        "Leading provider of sustainable technology solutions for waste management and renewable energy in Malaysia. We focus on creating innovative solutions that help businesses reduce their environmental footprint.",
      contact_info: "Phone: +60 3-2345-6789, Address: Kuala Lumpur, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates:
        "Recently won the Malaysia Green Technology Award 2024",
      program_participation:
        "Malaysian Social Enterprise Blueprint Program, UNSDG Impact Accelerator",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      company_name: "Rural Connect Sdn Bhd",
      email: "info@ruralconnect.my",
      website_url: "https://ruralconnect.my",
      sector: "Digital Inclusion",
      description:
        "Bridging the digital divide by providing affordable internet connectivity and digital literacy programs to rural communities across Malaysia.",
      contact_info: "Phone: +60 4-567-8901, Address: Penang, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates: "Expanded to 50 rural villages in 2024",
      program_participation:
        "Digital Malaysia Initiative, Social Impact Bond Program",
      created_at: "2024-02-20T14:15:00Z",
    },
    {
      id: 3,
      company_name: "Inclusive Education Hub",
      email: "hello@inclusiveedu.my",
      website_url: "https://inclusiveedu.my",
      sector: "Education & Training",
      description:
        "Providing inclusive education solutions and vocational training for persons with disabilities and underprivileged communities in Malaysia.",
      contact_info: "Phone: +60 7-890-1234, Address: Johor Bahru, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates: "Launched new vocational training center in Johor",
      program_participation:
        "Skills Development Fund, Inclusive Malaysia Program",
      created_at: "2024-03-10T09:45:00Z",
    },
    {
      id: 4,
      company_name: "AgriSmart Collective",
      email: "team@agrismart.my",
      website_url: "https://agrismart.my",
      sector: "Agriculture & Food Security",
      description:
        "Empowering smallholder farmers with smart agriculture technologies and direct market access to improve livelihoods and food security.",
      contact_info: "Phone: +60 9-234-5678, Address: Kelantan, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates:
        "Supported 1000+ farmers in adopting precision agriculture",
      program_participation:
        "Agriculture Transformation Programme, ASEAN Social Enterprise Network",
      created_at: "2024-04-05T16:20:00Z",
    },
    {
      id: 5,
      company_name: "Urban Microfinance Solutions",
      email: "support@urbanmfi.my",
      website_url: "https://urbanmfi.my",
      sector: "Financial Inclusion",
      description:
        "Providing microfinance and financial literacy services to low-income urban communities and micro-enterprises in Malaysian cities.",
      contact_info: "Phone: +60 3-456-7890, Address: Kuala Lumpur, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates: "Disbursed RM5 million in microloans in 2024",
      program_participation:
        "Financial Inclusion Initiative, Impact Investment Network",
      created_at: "2024-05-12T11:30:00Z",
    },
    {
      id: 6,
      company_name: "Clean Water Initiative",
      email: "info@cleanwater.my",
      website_url: "https://cleanwater.my",
      sector: "Water & Sanitation",
      description:
        "Installing water purification systems and promoting water conservation practices in underserved communities across Malaysia.",
      contact_info: "Phone: +60 8-567-8901, Address: Sabah, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates: "Provided clean water access to 20 remote villages",
      program_participation:
        "Water for All Program, Sustainable Development Goals Initiative",
      created_at: "2024-06-18T08:15:00Z",
    },
    {
      id: 7,
      company_name: "Elderly Care Connect",
      email: "care@elderlyconnect.my",
      website_url: "https://elderlyconnect.my",
      sector: "Healthcare & Elderly Care",
      description:
        "Technology-enabled elderly care services connecting seniors with healthcare providers and family members for better quality of life.",
      contact_info: "Phone: +60 6-789-0123, Address: Malacca, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates: "Launched AI-powered health monitoring system",
      program_participation:
        "Aging Society Preparedness Program, Health Innovation Challenge",
      created_at: "2024-07-22T13:45:00Z",
    },
    {
      id: 8,
      company_name: "Youth Skills Academy",
      email: "academy@youthskills.my",
      website_url: "https://youthskills.my",
      sector: "Youth Development",
      description:
        "Providing skills training and entrepreneurship development programs for unemployed youth in Malaysia, focusing on digital skills and green jobs.",
      contact_info: "Phone: +60 5-890-1234, Address: Perak, Malaysia",
      social_enterprise_status: "Verified",
      related_news_updates: "Graduated 500+ youth from skills programs in 2024",
      program_participation:
        "Youth Employment Program, Green Skills Initiative",
      created_at: "2024-08-30T15:00:00Z",
    },
  ];
};

export const insertCompany = async (companyData) => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .insert([companyData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error inserting company:", error);
    return { data: null, error };
  }
};

export const updateCompany = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating company:", error);
    return { data: null, error };
  }
};
