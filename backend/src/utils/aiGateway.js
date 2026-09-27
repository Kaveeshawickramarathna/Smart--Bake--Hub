/**
 * SaaS AI Gateway Client for Smart Bake Hub
 * Compatible with OpenAI v1 Chat Completions Spec
 * Targeted model: gpt-5.6-luna
 */

const getGatewayConfig = () => {
    return {
        url: process.env.AI_GATEWAY_URL || 'https://command.iobuilds.com/v1/chat/completions',
        apiKey: process.env.AI_GATEWAY_KEY,
        model: process.env.AI_MODEL || 'gpt-5.6-luna'
    };
};

/**
 * Clean markdown JSON blocks
 */
const cleanJsonString = (raw) => {
    if (!raw || typeof raw !== 'string') return '';
    let text = raw.trim();
    if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }
    return text;
};

/**
 * Send chat completion request to the SaaS AI Gateway
 * @param {Object} options
 * @param {Array} options.messages - Array of { role: 'system'|'user'|'assistant', content: string }
 * @param {number} [options.temperature=0.4]
 * @param {number} [options.max_tokens]
 * @param {boolean} [options.jsonMode=false]
 * @param {number} [options.retries=2]
 * @returns {Promise<{ content: string, parsed: any, raw: any }>}
 */
const sendChatCompletion = async ({
    messages,
    temperature = 0.4,
    max_tokens,
    jsonMode = false,
    retries = 2
}) => {
    const config = getGatewayConfig();

    const payload = {
        model: config.model,
        messages,
        temperature
    };

    payload.max_tokens = max_tokens || 3500;

    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

            const res = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errBody = await res.text().catch(() => '');
                throw new Error(`AI Gateway error [HTTP ${res.status}]: ${errBody || res.statusText}`);
            }

            const data = await res.json();
            const choice = data.choices && data.choices[0];
            const message = choice ? choice.message : null;

            // Extract content, checking both content and reasoning_content for thinking models
            const rawContent = message ? (message.content || message.reasoning_content || '') : '';

            let parsed = null;
            if (jsonMode && rawContent) {
                const cleaned = cleanJsonString(rawContent);
                try {
                    parsed = JSON.parse(cleaned);
                } catch (parseErr) {
                    console.warn('[AI Gateway] Failed to parse JSON response:', parseErr.message, 'Raw text:', cleaned.slice(0, 200));
                    // Try to find JSON inside substring if any extra text exists
                    const startIdx = cleaned.indexOf('{');
                    const arrIdx = cleaned.indexOf('[');
                    const bestStart = (startIdx !== -1 && (arrIdx === -1 || startIdx < arrIdx)) ? startIdx : arrIdx;
                    if (bestStart !== -1) {
                        const endIdx = cleaned.lastIndexOf(bestStart === startIdx ? '}' : ']');
                        if (endIdx > bestStart) {
                            const candidate = cleaned.slice(bestStart, endIdx + 1);
                            parsed = JSON.parse(candidate);
                        }
                    }
                }
            }

            return {
                content: rawContent,
                parsed,
                raw: data
            };
        } catch (err) {
            lastError = err;
            console.warn(`[AI Gateway] Attempt ${attempt + 1} failed:`, err.message);
            if (attempt < retries) {
                await new Promise(res => setTimeout(res, 2000 * (attempt + 1)));
            }
        }
    }

    throw lastError || new Error('AI Gateway request failed after retries');
};

module.exports = {
    sendChatCompletion,
    getGatewayConfig,
    cleanJsonString
};
