const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Sends journal text to the LLM and returns structured emotion analysis.
 * @param {string} text - The journal entry text
 * @returns {{ emotion: string, keywords: string[], summary: string }}
 */
const analyzeEmotion = async (text) => {
  // Lazy-init: env vars are guaranteed to be loaded by the time this is called
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  let rawResponse;

  try {
    const prompt = `Analyze the following journal entry and return ONLY valid JSON in this format:

{
  "emotion": "",
  "keywords": [],
  "summary": ""
}

Journal entry:
${text}

Return ONLY JSON. Do not include explanations or extra text.`;

    const result = await model.generateContent(prompt);
    
    // Safety check - sometimes response or text() is missing if blocked
    if (!result.response) {
      throw new Error('Empty response from LLM');
    }
    
    rawResponse = result.response.text().trim();

    if (!rawResponse) {
      throw new Error('Empty response from LLM');
    }

    // Strip markdown code fences if present
    const cleaned = rawResponse.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.emotion || !Array.isArray(parsed.keywords) || !parsed.summary) {
      throw new Error('LLM response missing required fields');
    }

    return {
      emotion: String(parsed.emotion).toLowerCase().trim(),
      keywords: parsed.keywords
        .filter((k) => typeof k === 'string')
        .map((k) => k.toLowerCase().trim()),
      summary: String(parsed.summary).trim(),
    };
  } catch (error) {
    // If the error is from JSON parsing, give a clearer message
    if (error instanceof SyntaxError) {
      console.error('[LLM] Failed to parse JSON. Raw response:', rawResponse);
      const err = new Error('LLM returned an invalid response format. Please try again.');
      err.statusCode = 502;
      throw err;
    }

    // Re-throw with status code for upstream handling
    if (!error.statusCode) error.statusCode = 502;
    throw error;
  }
};

module.exports = { analyzeEmotion };
