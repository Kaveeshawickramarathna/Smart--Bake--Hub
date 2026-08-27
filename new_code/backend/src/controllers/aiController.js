const { GoogleGenAI } = require('@google/genai');
const db = require('../config/db');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

const buildHeuristicForecast = (salesData, hourData, dbProducts) => {
    const categoryTotals = {};
    let totalRevenue = 0;
    let totalQuantity = 0;
    const distinctDates = new Set();

    salesData.forEach(row => {
        distinctDates.add(row.date);
        const cat = row.category || 'Uncategorized';
        const revenue = Number(row.total_revenue) || 0;
        const quantity = Number(row.total_quantity) || 0;
        if (!categoryTotals[cat]) categoryTotals[cat] = { revenue: 0, quantity: 0 };
        categoryTotals[cat].revenue += revenue;
        categoryTotals[cat].quantity += quantity;
        totalRevenue += revenue;
        totalQuantity += quantity;
    });

    const dayCount = Math.max(distinctDates.size, 1);
    const avgDailyRevenue = totalRevenue / dayCount;
    const avgDailyQuantity = totalQuantity / dayCount;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecastData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        const forecast = Math.round(avgDailyRevenue);
        return {
            name: `${dayNames[d.getDay()]}\n${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            forecast,
            actual: null,
            confidence: [Math.round(forecast * 0.85), Math.round(forecast * 1.15)]
        };
    });

    const palette = ['#2E1A12', '#C8843B', '#D4BFA0', '#E8DCC8', '#F7F4ED'];
    const categoryData = Object.entries(categoryTotals)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 5)
        .map(([name, val], idx) => ({ name, value: Math.round(val.quantity), color: palette[idx % palette.length] }));

    const hourTotals = {};
    hourData.forEach(row => { hourTotals[row.hourOfDay] = Number(row.total_quantity) || 0; });
    const sampleHours = [8, 10, 12, 14, 16, 18, 20, 22];
    const peakHourData = sampleHours.map(h => ({
        time: `${h.toString().padStart(2, '0')}:00`,
        demand: Math.round((hourTotals[h] || 0) / dayCount)
    }));

    const heatmapData = categoryData.length > 0
        ? categoryData.map(() => Array.from({ length: 7 }, () => Math.max(1, Math.round(Math.random() * 4) + 1)))
        : [[1, 1, 1, 1, 1, 1, 1]];

    const topItems = (dbProducts || []).slice(0, 6).map(p => ({
        name: p.name,
        category: p.category_name || 'General',
        price: Number(p.price) || 0,
        demand: `${Math.round(avgDailyQuantity / Math.max(dbProducts.length, 1)) || 1} units/day`,
        change: '+0.0%',
        recommendedStock: Math.max(1, Math.round(avgDailyQuantity / Math.max(dbProducts.length, 1)) * 2),
        icon: '🍞'
    }));

    return {
        totalForecastedSales: Math.round(avgDailyRevenue),
        salesGrowth: totalRevenue > 0 ? '+0.0%' : 'N/A',
        forecastedOrders: Math.round(avgDailyQuantity),
        ordersGrowth: totalRevenue > 0 ? '+0.0%' : 'N/A',
        predictedProductionQuantity: Math.round(avgDailyQuantity),
        itemsGrowth: '+0.0%',
        highDemandItemsCount: categoryData.filter(c => c.value > avgDailyQuantity / Math.max(categoryData.length, 1)).length,
        expectedRevenueIncrease: 'Rs. 0 (heuristic baseline, no growth data yet)',
        forecastData,
        categoryData: categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 0, color: palette[0] }],
        peakHourData,
        heatmapData,
        topItems,
        aiRecommendations: totalRevenue === 0
            ? [{ title: 'Not enough order history yet', description: 'Place a few orders so the daily forecast has real sales data to learn from.', type: 'alert' }]
            : [{ title: `Restock top category: ${categoryData[0]?.name || 'N/A'}`, description: 'This category has the highest recent order volume.', type: 'stock' }]
    };
};

const generateForecast = async (req, res) => {
    const today = getTodayDateString();
    const forceRefresh = req.query.force === 'true';

    try {
        if (!forceRefresh) {
            const [cached] = await db.query('SELECT payload FROM daily_forecasts WHERE forecast_date = ?', [today]);
            if (cached.length > 0) {
                return res.status(200).json(cached[0].payload);
            }
        }

        // 1. Fetch real historical sales data from the database (last 7 days for faster processing).
        // Sales can come from either standalone products or menu dishes, so combine both sources.
        const salesQuery = `
            SELECT date, category, SUM(total_quantity) as total_quantity, SUM(total_revenue) as total_revenue
            FROM (
                SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                       COALESCE(pc.name, 'Uncategorized') as category,
                       oi.quantity as total_quantity,
                       (oi.price * oi.quantity) as total_revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                LEFT JOIN product_categories pc ON p.category_id = pc.id
                WHERE oi.product_id IS NOT NULL
                  AND o.created_at >= DATE_SUB((SELECT IFNULL(MAX(created_at), NOW()) FROM orders), INTERVAL 7 DAY)
                UNION ALL
                SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                       COALESCE(dc.name, 'Menu') as category,
                       oi.quantity as total_quantity,
                       (oi.price * oi.quantity) as total_revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN dishes d ON oi.menu_id = d.id
                LEFT JOIN dish_categories dc ON d.category_id = dc.id
                WHERE oi.menu_id IS NOT NULL
                  AND o.created_at >= DATE_SUB((SELECT IFNULL(MAX(created_at), NOW()) FROM orders), INTERVAL 7 DAY)
                UNION ALL
                SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                       COALESCE(bc.name, 'Beverages') as category,
                       oi.quantity as total_quantity,
                       (oi.price * oi.quantity) as total_revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN beverages b ON oi.beverage_id = b.id
                LEFT JOIN beverage_categories bc ON b.beverage_category_id = bc.id
                WHERE oi.beverage_id IS NOT NULL
                  AND o.created_at >= DATE_SUB((SELECT IFNULL(MAX(created_at), NOW()) FROM orders), INTERVAL 7 DAY)
            ) combined
            GROUP BY date, category
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
            SELECT name, price, category_name FROM (
                SELECT p.name, p.price, pc.name as category_name
                FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id
                UNION ALL
                SELECT d.name, d.price, dc.name as category_name
                FROM dishes d LEFT JOIN dish_categories dc ON d.category_id = dc.id
                UNION ALL
                SELECT b.name, b.price, bc.name as category_name
                FROM beverages b LEFT JOIN beverage_categories bc ON b.beverage_category_id = bc.id
            ) combined
        `);

        if (salesData.length === 0) {
            const heuristic = buildHeuristicForecast([], [], dbProducts);
            await db.query(
                'INSERT INTO daily_forecasts (forecast_date, source, payload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload), source = VALUES(source), created_at = CURRENT_TIMESTAMP',
                [today, 'heuristic', JSON.stringify(heuristic)]
            );
            return res.status(200).json(heuristic);
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

            Task: Analyze the provided real historical data to determine trends and generate a highly accurate DAILY demand forecast JSON.
            
            Return ONLY a valid JSON object matching this schema exactly. Ensure numbers are mathematically plausible based on the historical data.
            - totalForecastedSales: number (expected daily revenue)
            - salesGrowth: string (e.g. "+15.2%" or "-2.1%" compared to previous day)
            - forecastedOrders: number (total daily orders expected)
            - ordersGrowth: string
            - predictedProductionQuantity: number (total daily items to bake)
            - itemsGrowth: string
            - highDemandItemsCount: number
            - expectedRevenueIncrease: string (e.g. "+Rs. 25,000")
            
            - forecastData: array of 7 objects (Mon to Sun of upcoming week) { name: 'Day', forecast: number (forecasted daily revenue), actual: number|null (leave null for future), confidence: [number, number] (min/max range) }
            - categoryData: array of 5 objects { name: 'Cakes'|'Meals'|'Bakery'|'Beverages'|'Snacks', value: number (forecasted daily quantity) }
            - peakHourData: array of 8 objects representing times (e.g. '08:00', '10:00') { time: string, demand: number (avg quantity per day) }
            - heatmapData: 2D array [5][7] of integers between 1 and 5 (representing daily demand intensity for the 5 categories over 7 days of the week)
            
            - topItems: array of 6 objects (the most popular products predicted strictly from the actual products list provided above) { name: string, category: string, price: number, demand: string (e.g. '30 units/day'), change: string, recommendedStock: number, icon: string (use a relevant emoji) }
            - aiRecommendations: array of 4 actionable insights objects { title: string, description: string, type: 'increase'|'stock'|'discount'|'alert' }
            
            No markdown formatting, just pure JSON output.
        `;

        let forecastJson;
        let forecastSource = 'ai';
        try {
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
            forecastJson = JSON.parse(cleanText);
        } catch (aiError) {
            console.warn("Gemini forecast unavailable, using heuristic fallback:", aiError.message || aiError);
            forecastJson = buildHeuristicForecast(salesData, hourData, dbProducts);
            forecastSource = 'heuristic';
        }

        await db.query(
            'INSERT INTO daily_forecasts (forecast_date, source, payload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload), source = VALUES(source), created_at = CURRENT_TIMESTAMP',
            [today, forecastSource, JSON.stringify(forecastJson)]
        );
        res.status(200).json(forecastJson);
    } catch (error) {
        console.error("AI Forecasting Error:", error);
        res.status(500).json({ message: "Failed to generate demand forecast", error: error.message });
    }
};

const getWasteSuggestions = async (req, res) => {
    let rawItems = [];
    try {
        const query = `
            SELECT 
                p.id, 
                p.name, 
                COALESCE(c.name, 'Bakery') as category_name, 
                COALESCE(p.price, 0) as price, 
                COALESCE(p.stock, 10) as stock, 
                p.expiry_date, 
                COALESCE(p.discount_percentage, 0) as discount_percentage,
                'product' as item_type
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id

            UNION ALL

            SELECT 
                d.id, 
                d.name, 
                COALESCE(dc.name, d.menu_category, 'Meals') as category_name, 
                COALESCE(d.price, 0) as price, 
                15 as stock, 
                NULL as expiry_date, 
                0 as discount_percentage,
                'dish' as item_type
            FROM dishes d
            LEFT JOIN dish_categories dc ON d.category_id = dc.id

            UNION ALL

            SELECT 
                b.id, 
                b.name, 
                COALESCE(bc.name, 'Beverages') as category_name, 
                COALESCE(b.price, 0) as price, 
                20 as stock, 
                NULL as expiry_date, 
                0 as discount_percentage,
                'beverage' as item_type
            FROM beverages b
            LEFT JOIN beverage_categories bc ON b.beverage_category_id = bc.id
        `;
        const [rows] = await db.query(query);
        rawItems = rows;
    } catch (dbErr) {
        console.error("Database query failed in getWasteSuggestions:", dbErr);
        return res.status(500).json({ message: "Database query failed", error: dbErr.message });
    }

    if (rawItems.length === 0) {
        return res.json([]);
    }

    const formattedInventory = rawItems.map((p, idx) => {
        let daysLeft = 6;
        if (p.expiry_date) {
            const expiryDate = new Date(p.expiry_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expiryDate.setHours(0, 0, 0, 0);
            const diffTime = expiryDate.getTime() - today.getTime();
            daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        } else {
            daysLeft = 6 - (idx % 5);
        }

        return {
            id: p.id,
            name: p.name,
            category: p.category_name,
            price: Number(p.price),
            stock: Number(p.stock),
            daysLeft,
            item_type: p.item_type,
            discount_percentage: Number(p.discount_percentage) || 0
        };
    });

    let aiSuggestions = [];
    try {
        const prompt = `
            You are an advanced AI Food Waste Reduction Engine for Smart Bake Hub.
            
            Below is the list of ALL real products, menu dishes, and beverages currently in our database:
            ${JSON.stringify(formattedInventory)}
            
            Task: Analyze this inventory and suggest an optimal markdown discount percentage (10, 15, 20, 25, 30, 35, or 50%) and risk classification ("HIGH RISK", "MEDIUM RISK", or "LOW RISK") for each item to minimize food waste and boost sales.
            
            Return ONLY a valid JSON array of objects matching this schema exactly:
            [
              {
                "id": number,
                "suggestedDiscount": number,
                "risk": "HIGH RISK" | "MEDIUM RISK" | "LOW RISK",
                "rationale": string
              }
            ]
            
            No markdown formatting, just pure JSON output.
        `;

        let response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        });

        let cleanText = response.text.trim();
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }
        aiSuggestions = JSON.parse(cleanText);
    } catch (aiErr) {
        console.warn("Gemini API waste analysis fallback to rule-based logic:", aiErr.message || aiErr);
    }

    const aiMap = new Map();
    if (Array.isArray(aiSuggestions)) {
        aiSuggestions.forEach(s => aiMap.set(String(s.id), s));
    }

    const result = formattedInventory.map(p => {
        const aiMatch = aiMap.get(String(p.id));
        let suggestedDiscount = 10;
        let risk = 'LOW RISK';
        let rationale = `Recommended 10% markdown to optimize inventory turnover.`;

        if (aiMatch) {
            suggestedDiscount = aiMatch.suggestedDiscount || 10;
            risk = aiMatch.risk || (p.daysLeft <= 2 ? 'HIGH RISK' : (p.daysLeft <= 4 ? 'MEDIUM RISK' : 'LOW RISK'));
            rationale = aiMatch.rationale || rationale;
        } else {
            if (p.daysLeft <= 2) {
                risk = 'HIGH RISK';
                suggestedDiscount = 35;
            } else if (p.daysLeft <= 4) {
                risk = 'MEDIUM RISK';
                suggestedDiscount = 20;
            } else {
                risk = 'LOW RISK';
                suggestedDiscount = 10;
            }
        }

        const applied = p.discount_percentage > 0;

        return {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            daysLeft: p.daysLeft,
            dailySales: '0.0',
            suggestedDiscount: applied ? p.discount_percentage : suggestedDiscount,
            risk: risk,
            applied: applied,
            rationale: rationale,
            item_type: p.item_type
        };
    });

    res.status(200).json(result);
};

module.exports = { generateForecast, getWasteSuggestions };
