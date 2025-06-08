const axios = require('axios');
const xml2js = require('xml2js');

/**
 * ASBhive News Scraper for Social Enterprises
 * Fetches latest news using Google News RSS feeds
 * Compatible with Next.js/React and Supabase integration
 */

class NewsScraperService {
    constructor() {
        this.parser = new xml2js.Parser();
        this.baseUrl = 'https://news.google.com/rss/search';
    }

    /**
     * Search for news articles about a specific company
     * @param {string} companyName - Name of the company to search for
     * @param {number} maxResults - Maximum number of results to return (default: 3)
     * @returns {Promise<Array>} Array of news articles
     */
    async searchCompanyNews(companyName, maxResults = 3) {
        try {
            // Clean company name for search
            const searchQuery = `"${companyName}" Malaysia social enterprise`;
            const encodedQuery = encodeURIComponent(searchQuery);
            const url = `${this.baseUrl}?q=${encodedQuery}&hl=en-MY&gl=MY&ceid=MY:en`;

            console.log(`🔍 Searching news for: ${companyName}`);
            
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const result = await this.parser.parseStringPromise(response.data);
            
            if (!result.rss || !result.rss.channel || !result.rss.channel[0].item) {
                console.log(`ℹ️  No news found for ${companyName}`);
                return [];
            }

            const items = result.rss.channel[0].item.slice(0, maxResults);
            
            const articles = items.map(item => ({
                title: this.cleanText(item.title[0]),
                link: item.link[0],
                pubDate: item.pubDate[0],
                source: this.extractSource(item.source),
                description: this.cleanText(item.description ? item.description[0] : '')
            }));

            console.log(`✅ Found ${articles.length} articles for ${companyName}`);
            return articles;

        } catch (error) {
            console.error(`❌ Error fetching news for ${companyName}:`, error.message);
            return [];
        }
    }

    /**
     * Update news for multiple companies
     * @param {Array} companies - Array of company objects with company_name field
     * @returns {Promise<Array>} Updated companies with news data
     */
    async updateCompaniesNews(companies) {
        console.log(`🚀 Starting news update for ${companies.length} companies...`);
        
        const updatedCompanies = [];
        const timestamp = new Date().toISOString();

        for (const company of companies) {
            try {
                const news = await this.searchCompanyNews(company.company_name, 2);
                
                const updatedCompany = {
                    ...company,
                    related_news_updates: this.formatNewsForDatabase(news, timestamp),
                    news_last_updated: timestamp,
                    news_articles_count: news.length
                };

                updatedCompanies.push(updatedCompany);
                
                // Add small delay to be respectful to Google News
                await this.delay(1000);
                
            } catch (error) {
                console.error(`Error updating news for ${company.company_name}:`, error);
                // Keep original company data if news update fails
                updatedCompanies.push({
                    ...company,
                    related_news_updates: company.related_news_updates || 'No recent news available',
                    news_last_updated: timestamp,
                    news_articles_count: 0
                });
            }
        }

        console.log(`✅ News update completed for ${updatedCompanies.length} companies`);
        return updatedCompanies;
    }

    /**
     * Format news articles for database storage
     * @param {Array} articles - Array of news articles
     * @param {string} timestamp - Update timestamp
     * @returns {string} Formatted news string for database
     */
    formatNewsForDatabase(articles, timestamp) {
        if (!articles || articles.length === 0) {
            return `No recent news available (Last checked: ${new Date(timestamp).toLocaleDateString()})`;
        }

        const newsText = articles.map((article, index) => {
            const date = new Date(article.pubDate).toLocaleDateString();
            return `${index + 1}. ${article.title} (${date}) - ${article.source}`;
        }).join(' | ');

        return `${newsText} (Last updated: ${new Date(timestamp).toLocaleDateString()})`;
    }

    /**
     * Extract source name from RSS source field
     * @param {Object} source - RSS source object
     * @returns {string} Clean source name
     */
    extractSource(source) {
        if (!source || !source[0]) return 'Unknown Source';
        return source[0]._ || source[0] || 'Unknown Source';
    }

    /**
     * Clean text content
     * @param {string} text - Raw text
     * @returns {string} Cleaned text
     */
    cleanText(text) {
        if (!text) return '';
        return text.replace(/<[^>]*>/g, '').trim();
    }

    /**
     * Add delay between requests
     * @param {number} ms - Milliseconds to delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test the news scraper with sample companies
     * @returns {Promise<Object>} Test results
     */
    async testScraper() {
        console.log('🧪 Testing News Scraper...');
        
        const testCompanies = [
            { id: 1, company_name: 'Biji-biji Initiative' },
            { id: 2, company_name: 'PichaEats' },
            { id: 3, company_name: 'Wild Asia' }
        ];

        const results = await this.updateCompaniesNews(testCompanies);
        
        console.log('📊 Test Results:');
        results.forEach(company => {
            console.log(`\n${company.company_name}:`);
            console.log(`  News: ${company.related_news_updates}`);
            console.log(`  Articles found: ${company.news_articles_count}`);
            console.log(`  Last updated: ${company.news_last_updated}`);
        });

        return {
            success: true,
            companiesTested: testCompanies.length,
            companiesUpdated: results.length,
            timestamp: new Date().toISOString(),
            results: results
        };
    }
}

// Export for use in Next.js API routes
module.exports = NewsScraperService;

// Test function for standalone execution
async function runTest() {
    const scraper = new NewsScraperService();
    const testResults = await scraper.testScraper();
    
    console.log('\n🎉 Test completed successfully!');
    console.log('📄 Results saved to test_results.json');
    
    // Save test results to file
    const fs = require('fs');
    fs.writeFileSync('test_results.json', JSON.stringify(testResults, null, 2));
    
    return testResults;
}

// Run test if this file is executed directly
if (require.main === module) {
    runTest().catch(console.error);
}

