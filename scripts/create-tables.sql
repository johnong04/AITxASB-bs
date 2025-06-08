-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    sector VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    founded_year INTEGER,
    impact_metrics TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (if using custom auth)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Enable Row Level Security (RLS) if using Supabase
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to companies" ON companies
    FOR SELECT USING (true);

-- Create policy to allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON companies
    FOR INSERT WITH CHECK (true);

-- Create policy to allow update for company owners
CREATE POLICY "Allow update for company owners" ON companies
    FOR UPDATE USING (email = auth.jwt() ->> 'email');
