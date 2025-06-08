# Tasks.md – ASBhive Ecosystem Data Aggregator

Track progress by marking ✓ when each item is working as intended.

---

## ✅ Setup

- [ ] Initialize Vite + React JS project
- [ ] Install shadcn/ui components
- [ ] Configure Supabase client (`@supabase/supabase-js`)
- [ ] Create Supabase tables: `companies`, `users` (optional)
- [ ] Install basic charting lib (Recharts or Chart.js)
- [ ] Setup environment variables for Supabase + Gemini

---

## 🔍 Page 1 – Landing Page (Search + Results + Graphs)

### UI & Logic
- [ ] Create search bar component
- [ ] Create cards component for displaying company data
- [ ] Create right-side panel for dynamic charts
- [ ] Fetch company data from Supabase on load
- [ ] Filter cards based on search term
- [ ] Send search term + data to Gemini
- [ ] Receive list of matching company IDs
- [ ] Display filtered cards only
- [ ] Add "Generate Summary" button
- [ ] Send selected companies to Gemini
- [ ] Gemini generate natural-language summary for Page 2


### Dynamic Charts
- [ ] Pass search results to Gemini for Python/JS chart code
- [ ] Render generated chart (Recharts or Chart.js)
- [ ] Update chart on new search

---

## 📄 Page 2 – Report Generation

- [ ] Display gemini summary on filtered companies
- [ ] (Optional) Add export to PDF/text

---

## ➕ Page 3 – Manual Entry Form

- [ ] Create form for adding a company (name, desc, sector, etc.)
- [ ] Validate inputs
- [ ] Submit data to Supabase `companies` table
- [ ] Refresh landing page with new data

---

## 🛠 Scraper Script (Backend)

- [ ] Write Python scraper (BeautifulSoup or Crawl4AI)
- [ ] Scrape company info from provided 15 URLs
- [ ] Structure data into Supabase-compatible format
- [ ] Insert into Supabase via API or direct client
- [ ] (Optional) Add rate limit / robots.txt handling

---

## 🔐 Optional – Auth

- [ ] Enable Supabase email auth
- [ ] Match user email to company email
- [ ] Allow users to edit their company card if matched

---

## ✅ Final Touches

- [ ] Ensure mobile responsiveness
- [ ] Polish styling to shadcn/ui aesthetics
- [ ] Clean up dead code and comments
- [ ] Final test of full flow (scrape → view → search → report → add → auth)
