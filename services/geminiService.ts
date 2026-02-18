
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchParams, Platform } from "../types.ts";

const getPlatformInstruction = (platform: Platform): string => {
  switch (platform) {
    case 'google_maps': 
      return 'DATA SOURCE: Google Maps / GMB. Focus on physical storefronts. VERIFY: Rating and address accuracy.';
    case 'google_search': 
      return 'DATA SOURCE: General Web. Look for official corporate footers, contact pages, and legal notices.';
    case 'instagram': 
      return 'DATA SOURCE: Instagram. Find the handle, bio link, and check for an "Email" or "Call" button in the profile metadata.';
    case 'linkedin': 
      return 'DATA SOURCE: LinkedIn. Extract the official company page, headquarters location, and verified employee count.';
    case 'facebook': 
      return 'DATA SOURCE: Facebook. Find the "About" section, official page name, and verified business status.';
    default: 
      return 'MULTI-VECTOR: Verify data across all available platforms. Reject any lead where phone/email seems generated or placeholder.';
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
    throw new Error("AI output format error. Details: The extraction engine returned malformed data.");
  }
};

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
      if (isRateLimit) {
        const delay = initialDelay * Math.pow(2, i);
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
    throw new Error("API configuration missing. Please ensure your project settings are correctly configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const platformConstraint = getPlatformInstruction(params.platform);
  const targetQuantity = params.quantity === 'unlimited' ? '20' : params.quantity;

  const prompt = `
    URGENT BUSINESS TASK: Extract high-accuracy business intelligence for "${params.query}" in "${params.city}, ${params.country}".
    
    CRITICAL RULES FOR DATA ACCURACY:
    1. NO HALLUCINATION: If you cannot find a real phone number or email, return "". NEVER guess.
    2. LOCALIZATION: All leads MUST be physically located in "${params.city}". 
    3. VALIDATION: Check for active signs of life (recent reviews, active websites, valid social links).
    4. SOURCE LOCK: ${platformConstraint}
    5. DATA CLEANING: Ensure proper capitalization. Remove any "(123) 456-7890" or "example@domain.com" placeholders.

    SPECIFIC EXTRACTION INSTRUCTIONS:
    - Use Google Search tool to browse specific "Contact" or "About" pages of identified businesses.
    - Identify "${params.platform}" profiles first, then verify contact details on their official website.
    - If "No Website Only" is active: ${params.noWebsiteOnly ? 'YES' : 'NO'}.
    - If "WhatsApp Priority" is active: ${params.whatsappOnly ? 'YES' : 'NO'}.

    QUANTITY: Exactly ${targetQuantity} leads.
  `;

  try {
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are the LeadScrape Master Auditor. Accuracy is 100x more important than quantity. You reject low-quality leads. Use the googleSearch tool for deep verification. You extract ONLY valid, real-world data points. If a detail is missing, return an empty string.`,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING, description: "Official legal name of the business." },
                category: { type: Type.STRING },
                city: { type: Type.STRING },
                country: { type: Type.STRING },
                coordinates: { type: Type.STRING, description: "Latitude and longitude if available." },
                website: { type: Type.STRING, description: "Full URL starting with https://" },
                phoneNumber: { type: Type.STRING, description: "International format: +[country][number]" },
                email: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                facebook: { type: Type.STRING },
                instagram: { type: Type.STRING },
                description: { type: Type.STRING, description: "Brief accurate summary of what they do." },
                rating: { type: Type.STRING },
                reviewCount: { type: Type.STRING },
                address: { type: Type.STRING },
                qualityScore: { type: Type.NUMBER, description: "Score 0-100 based on data completeness and verification." },
                qualityReasoning: { type: Type.STRING, description: "Why is this lead high/low quality?" },
                socialSignals: { type: Type.STRING, description: "e.g. 'Highly active on IG', 'Recently reviewed'" },
                verificationConfidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
              },
              required: ["companyName", "category", "qualityScore", "verificationConfidence"]
            }
          }
        }
      });
    });

    const generatedText = response.text ?? "";
    const rawLeads = extractJson(generatedText);
    const today = new Date().toISOString();
    
    // Extract real sources from grounding metadata for proof
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title || "Verification Link", uri: c.web.uri }));

    return rawLeads.map((item: any, index: number) => ({
      ...item,
      id: crypto.randomUUID(),
      generatedDate: today,
      searchCity: params.city,
      searchCountry: params.country,
      leadNumber: index + 1,
      status: 'new',
      contacted: false,
      sources: webSources.length > 0 ? webSources.slice(index % webSources.length, (index % webSources.length) + 1) : []
    }));
  } catch (err: any) {
    let cleanMessage = err.message || "Unknown error";
    if (cleanMessage.includes("429")) throw new Error("API Limit Reached: The extraction engine is cooling down. Please wait 60 seconds.");
    throw new Error(`Extraction Error: ${cleanMessage}`);
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
