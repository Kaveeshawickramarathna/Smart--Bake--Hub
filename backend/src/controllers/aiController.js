const { GoogleGenAI } = require('@google/genai');
const db = require('../config/db');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateForecast = async (req, res) => {
    try {
        // 1. Fetch real historical sales data from the database (last 7 days for faster processing)
        const salesQuery = `
            SELECT 
                DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                c.name as category,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.price * oi.quantity) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE o.created_at >= DATE_SUB((SELECT IFNULL(MAX(created_at), NOW()) FROM orders), INTERVAL 7 DAY)
            GROUP BY DATE(o.created_at), category
            ORDER BY date DESC
        `;
        
        const peakHourQuery = `
            SELECT 
                HOUR(o.created_at) as hourOfDay,
                SUM(oi.quantity) as total_quantity
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= DATE_SUB((SELECT IFNULL(MAX(created_at), NOW()) FROM orders), INTERVAL 7 DAY)
            GROUP BY HOUR(o.created_at)
            ORDER BY hourOfDay ASC
        `;

        const [salesData] = await db.query(salesQuery);
        const [hourData] = await db.query(peakHourQuery);
        const [dbProducts] = await db.query(`
            SELECT p.name, p.price, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
        `);

        if (salesData.length === 0) {
            return res.status(400).json({ message: "Not enough historical sales data to generate forecast." });
        }

        // 2. Feed this raw data as context into the Gemini API
        const prompt = `
            You are an advanced AI Demand Forecasting Engine for a commercial bakery called Smart Bake Hub.
            
            Below is the REAL historical sales data for the last 7 days, aggregated by date and category:
            ${JSON.stringify(salesData)}
            
            Below is the peak hour sales volume data over the same period:
            ${JSON.stringify(hourData)}

            Here is the list of actual products on the menu currently in the database:
            ${JSON.stringify(dbProducts)}

            Task: Analyze the provided real historical data to determine trends and generate a highly accurate 7-day FUTURE demand forecast JSON.
            
            Return ONLY a valid JSON object matching this schema exactly. Ensure numbers are mathematically plausible based on the historical data.
            - totalForecastedSales: number (expected revenue for next 7 days)
            - salesGrowth: string (e.g. "+15.2%" or "-2.1%" compared to previous week)
            - forecastedOrders: number (total orders expected)
            - ordersGrowth: string
            - predictedProductionQuantity: number (total items to bake)
            - itemsGrowth: string
            - highDemandItemsCount: number
            - expectedRevenueIncrease: string (e.g. "+Rs. 25,000")
            
            - forecastData: array of 7 objects (Mon to Sun of upcoming week) { name: 'Day', forecast: number (forecasted revenue), actual: number|null (leave null for future), confidence: [number, number] (min/max range) }
            - categoryData: array of 5 objects { name: 'Cakes'|'Meals'|'Bakery'|'Beverages'|'Snacks', value: number (forecasted quantity) }
            - peakHourData: array of 8 objects representing times (e.g. '08:00', '10:00') { time: string, demand: number (avg quantity) }
            - heatmapData: 2D array [5][7] of integers between 1 and 5 (representing demand intensity for the 5 categories over 7 days of the week)
            
            - topItems: array of 6 objects (the most popular products predicted strictly from the actual products list provided above) { name: string, category: string, price: number, demand: string (e.g. '300 units'), change: string, recommendedStock: number, icon: string (use a relevant emoji) }
            - aiRecommendations: array of 4 actionable insights objects { title: string, description: string, type: 'increase'|'stock'|'discount'|'alert' }
            
            No markdown formatting, just pure JSON output.
        `;

        let response;
        let retries = 3;
        while (retries > 0) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-lite',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        temperature: 0.4
                    }
                });
                break;
            } catch (err) {
                if (err.status === 503 && retries > 1) {
                    console.log("Gemini API overloaded. Retrying...");
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    throw err;
                }
            }
        }

        let cleanText = response.text.trim();
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }
        const forecastJson = JSON.parse(cleanText);
        res.status(200).json(forecastJson);
    } catch (error) {
        console.error("AI Forecasting Error:", error);
        res.status(500).json({ message: "Failed to generate AI forecast", error: error.message });
    }
};

const getWasteSuggestions = async (req, res) => {
    let products = [];
    try {
        // Query near-expiry products from database (stock > 0 and expiry_date set)
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.expiry_date IS NOT NULL AND p.stock > 0
        `;
        const [rows] = await db.query(query);
        products = rows;
    } catch (dbErr) {
        console.error("Database query failed:", dbErr);
        return res.status(500).json({ message: "Database query failed", error: dbErr.message });
    }

    if (products.length === 0) {
        return res.json([]);
    }

    // Format products for prompt/fallbacks
    const formattedProducts = products.map(p => {
        const expiryDate = new Date(p.expiry_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        return {
            id: p.id,
            name: p.name,
            category: p.category_name || 'Bakery Products',
            price: Number(p.price),
            stock: p.stock,
            expiry_date: p.expiry_date,
            daysLeft
        };
    });

    try {
        const prompt = `
            You are an advanced AI Food Waste Reduction Engine for a commercial bakery called Smart Bake Hub.
            
            Below is the list of products in our inventory that are nearing their expiration date.
            We need to sell them quickly to prevent food waste.
            
            Current Products:
            ${JSON.stringify(formattedProducts)}
            
            Task: Analyze this list and suggest an optimal discount percentage (from 10% to 75%, in increments of 5%) and a brief rationale (1 sentence) for each product to prevent waste.
            Suggestions should depend on:
            - Days left: fewer days left should lead to higher discounts (e.g. 1 day remaining -> 35-50% discount, today/0 days -> 50-75% discount, 5+ days -> 10-25% discount).
            - Stock quantity: higher stock volume should warrant slightly higher discounts to move inventory faster.
            - Product price and category.
            
            Return ONLY a valid JSON array of objects matching this schema exactly:
            [
              {
                "id": number,
                "suggestedDiscount": number,
                "rationale": string
              }
            ]
            
            No markdown formatting, just pure JSON output.
        `;

        let response;
        let retries = 3;
        while (retries > 0) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-lite',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        temperature: 0.2
                    }
                });
                break;
            } catch (err) {
                if (err.status === 503 && retries > 1) {
                    console.log("Gemini API overloaded. Retrying...");
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    throw err;
                }
            }
        }

        let cleanText = response.text.trim();
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }
        const suggestions = JSON.parse(cleanText);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("AI Waste Suggestions API error, falling back to mathematical heuristics:", error.message || error);
        
        try {
            // Generate fallback suggestions mathematically based on urgency and volume
            const fallbackSuggestions = formattedProducts.map(p => {
                let suggestedDiscount = 15;
                let rationale = "";

                if (p.daysLeft <= 1) {
                    suggestedDiscount = p.stock > 25 ? 50 : 35;
                    rationale = `High urgency: only ${p.daysLeft} day(s) left with ${p.stock} units. Recommended ${suggestedDiscount}% discount to clear stock.`;
                } else if (p.daysLeft <= 3) {
                    suggestedDiscount = p.stock > 25 ? 30 : 25;
                    rationale = `Medium urgency: ${p.daysLeft} days left. Suggested ${suggestedDiscount}% discount to accelerate sales.`;
                } else {
                    suggestedDiscount = p.stock > 30 ? 20 : 15;
                    rationale = `Low urgency: ${p.daysLeft} days left. Standard ${suggestedDiscount}% discount suggested to stimulate demand.`;
                }

                return {
                    id: p.id,
                    suggestedDiscount,
                    rationale
                };
            });

            res.status(200).json(fallbackSuggestions);
        } catch (fallbackErr) {
            console.error("Fallback generator error:", fallbackErr);
            res.status(500).json({ message: "Failed to generate suggestions", error: error.message });
        }
    }
};

module.exports = { generateForecast, getWasteSuggestions };
