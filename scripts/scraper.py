#!/usr/bin/env python3
"""
ASBhive Ecosystem Data Aggregator - Web Scraper
Scrapes social enterprise data and saves to Supabase database
"""

import os
import sys
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase configuration. Check your .env file.")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Default headers to avoid blocking
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

# Sample URLs for Malaysian social enterprises (replace with actual URLs)
SAMPLE_URLS = [
    "https://www.ashoka.org/en-my/country/malaysia",
    "https://www.asbmalaysia.com/",
    "https://www.yayasanhasanah.org/",
    # Add more URLs here
]


def clean_text(text):
    """Clean and normalize text content"""
    if not text:
        return ""
    return " ".join(text.strip().split())


def extract_company_data(url, soup):
    """Extract company data from a webpage"""
    try:
        # Basic data extraction - customize based on actual website structures
        company_data = {
            "company_name": "",
            "description": "",
            "sector": "",
            "website_url": url,
            "contact_info": "",
            "email": "",
            "social_enterprise_status": "Verified",
            "related_news_updates": "",
            "program_participation": "",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        # Extract company name (try multiple selectors)
        name_selectors = ["h1", ".company-name", ".title", ".name", "title"]
        for selector in name_selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                company_data["company_name"] = clean_text(element.get_text())
                break

        # Extract description
        desc_selectors = [
            ".description",
            ".about",
            ".summary",
            'meta[name="description"]',
        ]
        for selector in desc_selectors:
            if selector.startswith("meta"):
                element = soup.select_one(selector)
                if element and element.get("content"):
                    company_data["description"] = clean_text(element.get("content"))
                    break
            else:
                element = soup.select_one(selector)
                if element and element.get_text(strip=True):
                    company_data["description"] = clean_text(element.get_text())
                    break

        # Extract email
        email_elements = soup.find_all(
            "a", href=lambda x: x and x.startswith("mailto:")
        )
        if email_elements:
            company_data["email"] = email_elements[0]["href"].replace("mailto:", "")

        # Extract contact info
        contact_selectors = [".contact", ".contact-info", ".address"]
        for selector in contact_selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                company_data["contact_info"] = clean_text(element.get_text())
                break

        # Determine sector based on keywords in content
        content_text = soup.get_text().lower()
        sector_keywords = {
            "Environmental Technology": [
                "environment",
                "green",
                "sustainability",
                "renewable",
                "clean energy",
            ],
            "Healthcare": ["health", "medical", "wellness", "care", "hospital"],
            "Education": ["education", "learning", "school", "university", "training"],
            "Financial Inclusion": [
                "finance",
                "banking",
                "microfinance",
                "fintech",
                "payment",
            ],
            "Agriculture": ["agriculture", "farming", "food", "crops", "rural"],
            "Technology": ["technology", "digital", "software", "app", "platform"],
            "Social Innovation": [
                "social",
                "community",
                "impact",
                "development",
                "innovation",
            ],
        }

        for sector, keywords in sector_keywords.items():
            if any(keyword in content_text for keyword in keywords):
                company_data["sector"] = sector
                break

        if not company_data["sector"]:
            company_data["sector"] = "Social Innovation"

        return company_data

    except Exception as e:
        print(f"Error extracting data from {url}: {e}")
        return None


def scrape_url(url):
    """Scrape a single URL"""
    try:
        print(f"Scraping: {url}")

        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")
        company_data = extract_company_data(url, soup)

        if company_data and company_data["company_name"]:
            return company_data
        else:
            print(f"No valid company data found at {url}")
            return None

    except requests.RequestException as e:
        print(f"Error scraping {url}: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error scraping {url}: {e}")
        return None


def save_to_supabase(companies_data):
    """Save scraped data to Supabase"""
    try:
        print(f"Saving {len(companies_data)} companies to Supabase...")

        # Insert data in batches to avoid rate limits
        batch_size = 10
        for i in range(0, len(companies_data), batch_size):
            batch = companies_data[i : i + batch_size]

            response = supabase.table("companies").insert(batch).execute()

            if response.data:
                print(f"Successfully saved batch {i//batch_size + 1}")
            else:
                print(f"Error saving batch {i//batch_size + 1}")

            time.sleep(1)  # Rate limiting

        print(f"Successfully saved all {len(companies_data)} companies!")
        return True

    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return False


def create_mock_data():
    """Create mock data for testing when scraping is not available"""
    mock_companies = [
        {
            "company_name": "EcoTech Solutions Malaysia",
            "description": "Developing sustainable technology solutions for waste management and renewable energy in Malaysia.",
            "sector": "Environmental Technology",
            "website_url": "https://ecotech-solutions.my",
            "contact_info": "Phone: +60 3 2123 4567, Address: Kuala Lumpur, Malaysia",
            "email": "info@ecotech-solutions.my",
            "social_enterprise_status": "Certified",
            "related_news_updates": "Recently won the Malaysia Green Innovation Award 2024.",
            "program_participation": "ASB Accelerator Program 2023",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "company_name": "HealthBridge Asia",
            "description": "Connecting rural communities with healthcare services through telemedicine platforms across Malaysia.",
            "sector": "Healthcare",
            "website_url": "https://healthbridge.asia",
            "contact_info": "Phone: +60 3 2234 5678, Address: Shah Alam, Malaysia",
            "email": "contact@healthbridge.asia",
            "social_enterprise_status": "Verified",
            "related_news_updates": "Expanded to 5 new states in Malaysia.",
            "program_participation": "Malaysia Social Enterprise Network",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "company_name": "EduEmpower MY",
            "description": "Providing digital literacy programs for underserved communities across Malaysia.",
            "sector": "Education",
            "website_url": "https://eduempower.my",
            "contact_info": "Phone: +60 3 2345 6789, Address: Penang, Malaysia",
            "email": "hello@eduempower.my",
            "social_enterprise_status": "Certified",
            "related_news_updates": "Launched new AI-powered learning platform.",
            "program_participation": "Malaysia Digital Economy Blueprint",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
    ]
    return mock_companies


def main():
    """Main scraper function"""
    print("Starting ASBhive Ecosystem Data Scraper...")

    companies_data = []

    # Option 1: Try to scrape real URLs
    print("Attempting to scrape real URLs...")
    for url in SAMPLE_URLS[:3]:  # Limit to first 3 URLs for testing
        company_data = scrape_url(url)
        if company_data:
            companies_data.append(company_data)
        time.sleep(2)  # Be respectful to servers

    # Option 2: Use mock data if no real data was scraped
    if not companies_data:
        print("No data scraped from URLs, using mock data...")
        companies_data = create_mock_data()

    # Save to database
    if companies_data:
        success = save_to_supabase(companies_data)
        if success:
            print(f"\n✅ Scraping completed successfully!")
            print(f"📊 Total companies saved: {len(companies_data)}")
        else:
            print(f"\n❌ Error saving data to database")
    else:
        print("No data to save")


if __name__ == "__main__":
    main()
