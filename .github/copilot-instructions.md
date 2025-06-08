# Copilot Instructions for ASBhive Ecosystem Data Aggregator Project

These instructions guide GitHub Copilot when assisting with the ASBhive Ecosystem Data Aggregator hackathon project. Follow these guidelines to ensure consistent, high-quality code that meets the project requirements.

## Project Overview

ASBhive Ecosystem Data Aggregator is a React JS web app built with Vite that aggregates, displays, and analyzes data on Malaysian Social Enterprises. The app integrates:

- React JS frontend with Vite
- shadcn/ui components for styling
- Supabase for database storage
- Gemini LLM for intelligent search and data analysis
- Data visualization with Recharts or Chart.js
- Python scraper for data collection

## Task Management

### Progress Tracking

1. When implementing a feature from Tasks.md:

   - First, understand the task requirements from PRD.md
   - Implement the feature fully with proper error handling
   - Test the functionality to ensure it works as intended
   - **Only then mark the task as complete** by replacing `- [ ]` with `- [x]` in Tasks.md

2. Group related tasks together when implementing to ensure cohesive functionality

   - Example: "Create search bar component" and "Filter cards based on search term"

3. Regular progress check:
   - Periodically check Tasks.md to identify next priority tasks
   - Focus on completing one section at a time for better integration

## Implementation Guidelines

### Recommended Vite + React Project Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   ├── services/           # API services (Supabase, Gemini)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── context/            # React context providers
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Entry point
├── .env                    # Environment variables (gitignored)
├── .env.example            # Example environment variables
└── vite.config.js          # Vite configuration
```

### Vite Best Practices (v5)

1. Use ES modules for all imports/exports:

   ```javascript
   // Good
   import { useState } from 'react';
   export function MyComponent() {...}

   // Avoid
   const React = require('react');
   module.exports = function MyComponent() {...}
   ```

2. Take advantage of Vite's fast HMR:

   - Use `import.meta.hot` for custom HMR handling
   - Place components in separate files for better HMR

3. Asset handling:

   - Import assets directly in components: `import logo from './logo.png'`
   - For dynamic assets, use `new URL('./path', import.meta.url).href`

4. Path aliases:

   - Configure path aliases in vite.config.js for cleaner imports:

   ```javascript
   // vite.config.js
   export default defineConfig({
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   });
   ```

5. Environment variables:
   - Access with `import.meta.env.VITE_*`
   - Only variables prefixed with `VITE_` are exposed to client code

### React Best Practices

1. Use functional components with hooks:

   ```jsx
   function CompanyCard({ company }) {
     const [expanded, setExpanded] = useState(false);
     return (/* JSX */);
   }
   ```

2. Custom hooks for reusable logic:

   ```jsx
   function useSupabaseData() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(true);
     // Fetch logic
     return { data, loading };
   }
   ```

3. Proper state management:

   - Use React Context for global state
   - Keep component state as local as possible
   - Consider using React Query for API state management

4. Performance optimization:
   - Use `useMemo` and `useCallback` for expensive operations
   - Implement virtualized lists for large data sets
   - Use React.memo for pure components

### shadcn/ui Implementation

1. Follow shadcn/ui component installation process:

   ```bash
   npx shadcn-ui@latest add button
   ```

2. Create consistent component variants:

   ```jsx
   // Example button variants
   <Button variant="default">Default</Button>
   <Button variant="destructive">Delete</Button>
   ```

3. Use Tailwind utility classes for custom styling

### Supabase Integration

1. Setup with proper environment variables:

   ```javascript
   const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );
   ```

2. Table structure for companies:

   ```sql
   -- companies table structure
   id: uuid (primary key)
   name: text (not null)
   description: text
   sector: text
   website: text
   tags: text[] (array)
   logo_url: text
   email: text
   created_at: timestamp with time zone
   ```

3. Implement proper error handling:
   ```javascript
   const fetchCompanies = async () => {
     try {
       const { data, error } = await supabase.from("companies").select("*");

       if (error) throw error;
       return data;
     } catch (error) {
       console.error("Error fetching companies:", error);
       return [];
     }
   };
   ```

### Gemini Integration

1. Set up the Gemini API client:

   ```javascript
   const { GoogleGenerativeAI } = require("@google/generative-ai");

   const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
   ```

2. Structure prompts effectively for search:

   ```javascript
   async function searchCompanies(query, companies) {
     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

     const prompt = `
       Given the search query: "${query}"
       And the following companies data:
       ${JSON.stringify(companies)}
       
       Return ONLY a JSON array of company IDs that best match the search, in order of relevance.
       Example: ["123e4567-e89b-12d3-a456-426614174000", "523e4567-e89b-12d3-a456-426614174111"]
     `;

     try {
       const result = await model.generateContent(prompt);
       const response = result.response;
       const text = response.text();
       return JSON.parse(text);
     } catch (error) {
       console.error("Error calling Gemini API:", error);
       return [];
     }
   }
   ```

3. Generate dynamic charts:
   - Include descriptive chart requirements in prompts
   - Parse and validate returned JavaScript code before execution
   - Implement fallback charts if generation fails

### Data Visualization

1. Choose either Recharts (preferred) or Chart.js
2. Create reusable chart components:

   ```jsx
   function DynamicChart({ data, type }) {
     // Logic to determine chart type and format data
     return (
       <div className="chart-container">
         {type === "bar" && <BarChart data={formattedData} />}
         {type === "pie" && <PieChart data={formattedData} />}
         {/* Other chart types */}
       </div>
     );
   }
   ```

3. Handle dynamic chart generation from Gemini:
   - Implement a safe way to execute generated chart code
   - Add proper error boundaries around chart components

### Python Scraper

1. Use BeautifulSoup or Crawl4AI based on website structure:

   ```python
   import requests
   from bs4 import BeautifulSoup

   def scrape_company(url):
       response = requests.get(url)
       soup = BeautifulSoup(response.text, 'html.parser')
       # Extract company info
       # ...
       return company_data
   ```

2. Structure data for Supabase insertion:

   ```python
   companies = [
       {
           "name": "Company Name",
           "description": "Company description...",
           "sector": "FinTech",
           "website": "https://example.com",
           "tags": ["sustainability", "finance"]
       }
       # More companies...
   ]
   ```

3. Use Supabase Python client for data insertion:

   ```python
   from supabase import create_client

   supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

   for company in companies:
       result = supabase.table('companies').insert(company).execute()
   ```

## Testing Guidelines

1. Test components in isolation
2. Test API integrations with mock data
3. Test error handling scenarios
4. Verify responsive design on different screen sizes

## Important File Context

Keep track of these key files throughout development:

1. `src/App.jsx` - Main application component and routing
2. `src/services/supabase.js` - Supabase client configuration
3. `src/services/gemini.js` - Gemini API integration
4. `src/components/SearchBar.jsx` - Search functionality
5. `src/components/CompanyCard.jsx` - Company display
6. `src/components/DynamicChart.jsx` - Chart visualization
7. `src/pages/LandingPage.jsx` - Main search and results page
8. `src/pages/ReportPage.jsx` - Gemini-generated reports
9. `src/pages/EntryForm.jsx` - Manual company submission form
10. `scripts/scraper.py` - Python scraper script

## Performance Considerations

1. Use React.lazy for code splitting:

   ```jsx
   const ReportPage = React.lazy(() => import("./pages/ReportPage"));
   ```

2. Implement pagination for company cards
3. Optimize API calls with debouncing and caching
4. Use WebP format for images with proper loading strategies
5. Minimize third-party dependencies

## Accessibility

1. Use proper semantic HTML elements
2. Include ARIA attributes where appropriate
3. Ensure keyboard navigation works correctly
4. Maintain sufficient color contrast for text

## Final Checklist

Before completing the project, verify:

1. All Tasks.md items are properly marked as complete
2. The application works end-to-end (scrape → view → search → report → add → auth)
3. Code is well-commented and follows consistent style
4. Responsive design works on mobile, tablet, and desktop
5. Error handling is implemented for all API calls
6. Environment variables are documented in .env.example

## Command Reference

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run scraper script
python scripts/scraper.py
```

Remember to update Tasks.md as features are successfully implemented, and follow these instructions to maintain high code quality throughout the project development.
