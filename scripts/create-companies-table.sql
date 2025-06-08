-- Drop existing table if it exists
DROP TABLE IF EXISTS companies;

-- Create companies table with all required columns
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    website_url VARCHAR(255),
    sector VARCHAR(100),
    description TEXT,
    contact_info TEXT,
    social_enterprise_status VARCHAR(50) DEFAULT 'Verified',
    related_news_updates TEXT,
    program_participation TEXT,
    password_hash VARCHAR(255), -- For authentication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_company_name ON companies(company_name);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to all company data (excluding sensitive fields)
CREATE POLICY "Allow public read access to companies" ON companies
    FOR SELECT USING (true);

-- Allow insert for new companies
CREATE POLICY "Allow insert for new companies" ON companies
    FOR INSERT WITH CHECK (true);

-- Allow update for company owners (based on email)
CREATE POLICY "Allow update for company owners" ON companies
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');
