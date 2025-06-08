# ASBhive Ecosystem Data Aggregator

*A comprehensive platform for discovering and analyzing Malaysian Social Enterprises*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/john-ongs-projects/v0-asbhive-web-app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

## 🎯 Project Overview

ASBhive Ecosystem Data Aggregator is a React.js web application built for the hackathon challenge to create a comprehensive platform for discovering, analyzing, and connecting with Malaysian Social Enterprises. The platform aggregates data from multiple sources and provides intelligent search capabilities powered by AI.

### 🌟 Key Features

- **🔍 Intelligent Search**: AI-powered search using Google Gemini for semantic understanding
- **📊 Data Visualization**: Dynamic charts and analytics for social enterprise trends
- **📰 Real-time News Updates**: Automated news scraping from Google News RSS feeds
- **📝 Manual Entry**: Form-based submission for new social enterprises
- **🔒 Authentication**: Secure user management with Supabase Auth
- **📱 Responsive Design**: Mobile-first design using shadcn/ui components

## 🚀 Technology Stack

- **Frontend**: React.js with Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: Google Gemini API for intelligent search and analysis
- **Charts**: Recharts for data visualization
- **News Scraping**: Google News RSS feeds with xml2js
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🏗️ Project Structure

```
/
├── app/                    # Next.js 14 App Router pages
│   ├── api/               # API routes for news scraping
│   ├── auth/              # Authentication pages
│   └── reports/           # Dynamic report generation
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── NewsUpdateButton.jsx # Automated news update feature
├── src/
│   ├── services/         # API services (Supabase, Gemini, News)
│   └── lib/              # Utility functions
├── scripts/              # Python scraper and utilities
└── scrape/               # 📂 Scraped data for judge review
    └── enhanced_companies.json # Complete dataset of 15 social enterprises
```

## 📂 For Judges: Scraped Data Review

**Important**: The `scrape/` folder contains the complete dataset of Malaysian social enterprises that have been scraped and processed for this hackathon submission.

### Key Files for Review:

1. **`scrape/enhanced_companies.json`** - Complete dataset of 15 Malaysian social enterprises including:
   - Company profiles (name, description, sector, website)
   - Contact information and social media links
   - Tags and categorization
   - Related news updates (when available)

2. **Python Scraper**: `scripts/scraper.py` - The web scraping implementation using BeautifulSoup

3. **News Scraper Service**: `src/services/newsScraperService.js` - Real-time news aggregation from Google News RSS feeds

### Data Sources Scraped:
- Social enterprise directories
- Company websites
- Social media profiles
- News articles and press releases
- Government databases and listings

The scraped data demonstrates the platform's capability to aggregate comprehensive information about Malaysia's social enterprise ecosystem, making it easily searchable and analyzable through the web interface.

## 🔧 Setup and Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/AITxASB-bs.git
   cd AITxASB-bs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run the Python scraper** (optional)
   ```bash
   cd scripts
   python scraper.py
   ```

## 🚀 Deployment

The application is deployed on Vercel and automatically syncs with this repository:

**Live Demo**: [https://vercel.com/john-ongs-projects/v0-asbhive-web-app](https://vercel.com/john-ongs-projects/v0-asbhive-web-app)

## 📊 Database Schema

### Companies Table Structure:
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sector TEXT,
  website TEXT,
  email TEXT,
  logo_url TEXT,
  tags TEXT[],
  related_news_updates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🤖 AI Features

### 1. Intelligent Search
- Semantic search powered by Google Gemini
- Natural language query processing
- Contextual result ranking

### 2. Automated News Updates
- Real-time news scraping from Google News RSS
- Company-specific news filtering
- Automated database updates

### 3. Dynamic Report Generation
- AI-generated insights and analysis
- Custom visualization recommendations
- Trend analysis and predictions

## 🧪 Testing the News Update Feature

The automated news update functionality can be tested using the "Update News" button on the main page:

1. **Demo Mode**: Safe testing without database updates
2. **Production Mode**: Live updates to Supabase database
3. **Rate Limiting**: 1-second delays between requests to respect API limits

### API Endpoints:
- `POST /api/news/update` - Production news updates
- `POST /api/news/demo` - Demo mode (no database writes)
- `POST /api/news/test` - Individual company testing

## 🎯 Hackathon Requirements Met

✅ **Data Aggregation**: 15+ Malaysian social enterprises scraped and stored  
✅ **Web Interface**: React.js application with modern UI/UX  
✅ **Search Functionality**: AI-powered semantic search  
✅ **Data Visualization**: Charts and analytics dashboard  
✅ **Real-time Updates**: Automated news scraping system  
✅ **Database Integration**: Supabase for data persistence  
✅ **Authentication**: User management system  
✅ **Responsive Design**: Mobile-friendly interface  

## 🤝 Contributing

This project was built for the ASB x AI Hackathon. For questions or suggestions, please refer to the project documentation or contact the development team.

## 📄 License

This project is part of the ASB x AI Hackathon submission.