-- Insert sample companies with the new schema
INSERT INTO companies (
    company_name, 
    email, 
    website_url, 
    sector, 
    description, 
    contact_info, 
    social_enterprise_status, 
    related_news_updates, 
    program_participation
) VALUES
(
    'EcoTech Solutions',
    'contact@ecotech-solutions.com',
    'https://ecotech-solutions.com',
    'Environmental Technology',
    'Developing sustainable technology solutions for waste management and renewable energy. Our innovative approach combines IoT sensors with AI analytics to optimize waste collection routes and reduce carbon emissions.',
    'Phone: +60 3 2123 4567, Address: Kuala Lumpur, Malaysia',
    'Certified',
    'Recently won the Green Innovation Award 2024. Featured in TechCrunch for breakthrough waste management solution.',
    'ASB Accelerator Program 2023, UN Global Compact'
),
(
    'HealthBridge',
    'info@healthbridge.asia',
    'https://healthbridge.asia',
    'Healthcare',
    'Connecting rural communities with healthcare services through telemedicine platforms. We provide remote consultations, health monitoring, and medical supply delivery to underserved areas.',
    'Phone: +66 2 123 4567, Address: Bangkok, Thailand',
    'Verified',
    'Expanded to 5 new provinces in Thailand. Partnership announced with Ministry of Health.',
    'ASEAN Social Enterprise Network, Health Innovation Hub'
),
(
    'EduEmpower',
    'hello@eduempower.org',
    'https://eduempower.org',
    'Education',
    'Providing digital literacy programs for underserved communities across Southeast Asia. Our mobile learning labs bring technology education directly to rural schools and community centers.',
    'Phone: +63 2 8123 4567, Address: Manila, Philippines',
    'Certified',
    'Launched new AI-powered learning platform. Received $500K funding from education foundation.',
    'UNESCO Education Program, Digital Skills Initiative'
),
(
    'AgriConnect',
    'support@agriconnect.co',
    'https://agriconnect.co',
    'Agriculture',
    'Connecting smallholder farmers with markets through a digital platform. We provide price transparency, quality certification, and direct buyer connections to increase farmer incomes.',
    'Phone: +84 28 1234 5678, Address: Ho Chi Minh City, Vietnam',
    'Verified',
    'Reached 10,000 farmers milestone. New partnership with major supermarket chain.',
    'ASEAN Agriculture Innovation Program, FAO Digital Agriculture Initiative'
),
(
    'CleanWater Initiative',
    'contact@cleanwater.org',
    'https://cleanwater.org',
    'Water & Sanitation',
    'Installing solar-powered water purification systems in rural communities. Our low-cost, sustainable solutions provide clean drinking water to areas without reliable electricity or water infrastructure.',
    'Phone: +62 21 1234 5678, Address: Jakarta, Indonesia',
    'Certified',
    'Deployed 50 new water systems this quarter. Featured in National Geographic documentary.',
    'UN Water Action Decade, Indonesia Clean Water Alliance'
),
(
    'MicroFinance Plus',
    'info@microfinanceplus.com',
    'https://microfinanceplus.com',
    'Financial Inclusion',
    'Providing microloans and financial literacy training to women entrepreneurs in rural areas. Our mobile-first approach makes financial services accessible to the unbanked population.',
    'Phone: +880 2 1234 5678, Address: Dhaka, Bangladesh',
    'Verified',
    'Achieved 99% loan repayment rate. Expanding to 3 new districts.',
    'Grameen Foundation Network, Women Entrepreneurship Program'
),
(
    'Solar Schools',
    'contact@solarschools.asia',
    'https://solarschools.asia',
    'Clean Energy',
    'Installing solar power systems in schools across rural Asia. We provide clean energy solutions that reduce operating costs and create sustainable learning environments.',
    'Phone: +94 11 234 5678, Address: Colombo, Sri Lanka',
    'Certified',
    'Completed 200th school installation. Government partnership for national rollout.',
    'Asian Development Bank Energy Program, Solar for Schools Initiative'
),
(
    'FoodRescue Network',
    'hello@foodrescue.net',
    'https://foodrescue.net',
    'Food Security',
    'Redistributing surplus food from restaurants and supermarkets to food banks and shelters. Our app-based platform connects food donors with recipients to reduce waste and fight hunger.',
    'Phone: +65 6123 4567, Address: Singapore',
    'Verified',
    'Prevented 1 million meals from waste. Expanding to Malaysia and Thailand.',
    'Zero Waste Singapore, ASEAN Food Security Network'
);
