
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchParams, Platform } from "../types.ts";

const getPlatformInstruction = (platform: Platform): string => {
  switch (platform) {
    case 'google_maps': return 'prioritizing verified Google Business Profiles with high physical foot traffic indicators';
    case 'google_search': return 'crawling deep web directories, local chambers of commerce, and niche-specific registries';
    case 'instagram': return 'analyzing engagement metrics, recent story activity, and linktree configurations for legitimacy';
    case 'linkedin': return 'evaluating corporate headcounts, recent hiring activity, and employee verification status';
    case 'facebook': return 'checking community responsiveness, recent post frequency, and verified business badges';
    default: return 'executing a multi-vector search across maps, social signals, and corporate registries';
  }
};

const extractJson = (text: string): any[] => {
  if (!text) return [];
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (innerE) {
        console.error("Failed to parse regex-extracted array", innerE);
      }
    }
    throw new Error("AI output format error. Please try a more specific search term.");
  }
};

/**
 * Executes a function with exponential backoff retries.
 * Useful for handling 429 (Rate Limit) and 500 (Internal Error).
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorMsg = err.message || "";
      const isRateLimit = errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota");
      const isServerError = errorMsg.includes("500") || errorMsg.includes("503");
      
      if (isRateLimit || isServerError) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export const searchLeads = async (params: SearchParams): Promise<Lead[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API configuration missing. Please ensure the API_KEY environment variable is set in your Netlify dashboard.");
  }

  // Verification log for debugging deployment issues
  console.info("Initializing Lead Extraction using model: gemini-3-flash-preview");

  const ai = new GoogleGenAI({ apiKey });
  const platformContext = getPlatformInstruction(params.platform);
  const targetQuantity = params.quantity === 'unlimited' ? '20' : params.quantity;

  const noWebsiteConstraint = params.noWebsiteOnly 
    ? "MANDATORY: Return ONLY businesses that do NOT have a website listed."
    : "Include businesses regardless of website status.";

  const whatsappConstraint = params.whatsappOnly
    ? "WHATSAPP: Focus on leads where a mobile number or WhatsApp contact is evident."
    : "";

  const prompt = `
    TASK: Generate a high-fidelity business intelligence report for "${params.query}" in "${params.city}, ${params.country}".
    QUANTITY: Extract exactly ${targetQuantity} unique, active leads.
    VECTORS: ${platformContext}.
    CONSTRAINTS: ${noWebsiteConstraint} ${whatsappConstraint}
    
    Ensure all extracted data is current. Return results as a valid JSON array.
  `;

  try {
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are the LeadScrape Architect. Extract accurate business entities. QualityScore (0-100) must reflect the data completeness. Output ONLY raw JSON.",
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                category: { type: Type.STRING },
                city: { type: Type.STRING },
                country: { type: Type.STRING },
                coordinates: { type: Type.STRING },
                website: { type: Type.STRING },
                phoneNumber: { type: Type.STRING },
                email: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                facebook: { type: Type.STRING },
                instagram: { type: Type.STRING },
                description: { type: Type.STRING },
                rating: { type: Type.STRING },
                reviewCount: { type: Type.STRING },
                address: { type: Type.STRING },
                qualityScore: { type: Type.NUMBER },
                qualityReasoning: { type: Type.STRING },
              },
              required: ["companyName", "category", "qualityScore"]
            }
          }
        }
      });
    });

    const generatedText = response.text ?? "";
    const rawLeads = extractJson(generatedText);
    const today = new Date().toISOString();
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title || "Source link", uri: c.web.uri }));

    return rawLeads.map((item: any, index: number) => ({
      ...item,
      id: crypto.randomUUID(),
      generatedDate: today,
      searchCity: params.city,
      searchCountry: params.country,
      leadNumber: index + 1,
      status: 'new',
      contacted: false,
      qualityScore: Number(item.qualityScore) || 75,
      sources: webSources.length > 0 ? webSources.slice(index % webSources.length, (index % webSources.length) + 2) : []
    }));
  } catch (err: any) {
    let cleanMessage = err.message || "Unknown error";
    
    // Try to parse JSON error message from SDK
    try {
      if (cleanMessage.startsWith('{')) {
        const parsed = JSON.parse(cleanMessage);
        if (parsed.error && parsed.error.message) {
          cleanMessage = parsed.error.message;
        }
      }
    } catch (e) { /* use raw message if parsing fails */ }

    if (cleanMessage.includes("429") || cleanMessage.toLowerCase().includes("quota")) {
      throw new Error("API Quota Reached: The Gemini Flash model is currently at its free-tier limit. Please wait 60 seconds or upgrade your Google Cloud Project to a paid plan for higher limits.");
    }
    
    throw new Error(`Extraction Failed: ${cleanMessage}`);
  }
};

export const sendToWebhook = async (lead: Lead, webhookUrl: string): Promise<boolean> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: "lead_discovered",
        timestamp: new Date().toISOString(),
        lead: lead
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Webhook Dispatch Failed:", error);
    return false;
  }
};
