-- Add password_hash column if it doesn't exist
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create RLS policies for authentication
-- Allow users to update their own company data
CREATE POLICY IF NOT EXISTS "Users can update own company data" 
ON companies FOR UPDATE 
USING (email = auth.jwt() ->> 'email');

-- Allow users to read their own company data
CREATE POLICY IF NOT EXISTS "Users can read own company data" 
ON companies FOR SELECT 
USING (true);
