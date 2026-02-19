
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchParams, Platform } from "../types.ts";

const getPlatformInstruction = (platform: Platform): string => {
  switch (platform) {
    case 'google_maps': 
      return 'HARD CONSTRAINT: Every lead MUST be a verified Google Business Profile. Cross-reference coordinates.';
    case 'google_search': 
      return 'SOURCE: Aggressively crawl official business registries and directories.';
    case 'instagram': 
      return 'HARD CONSTRAINT: Target active Instagram handles only.';
    case 'linkedin': 
      return 'HARD CONSTRAINT: Extract verified LinkedIn Company Pages.';
    case 'facebook': 
      return 'HARD CONSTRAINT: Target verified Facebook Pages.';
    default: 
      return 'MULTI-VECTOR: Harmonize signals from social and maps.';
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
    throw new Error("AI intelligence output was malformed.");
  }
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 3000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (err.message.includes("429") || err.message.toLowerCase().includes("quota")) {
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
  // Use the key injected by the platform
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Cloud authentication failed. Please connect your API key.");

  const ai = new GoogleGenAI({ apiKey });
  const platformConstraint = getPlatformInstruction(params.platform);
  const targetQuantity = params.quantity === 'unlimited' ? '25' : params.quantity;

  const noWebRule = params.noWebsiteOnly 
    ? "CRITICAL MANDATE: You MUST REJECT any business that has an official website URL. ONLY extract local businesses that rely solely on social media or phone. If you find a URL, DISCARD the lead immediately." 
    : "";
  
  const waRule = params.whatsappOnly 
    ? "CRITICAL MANDATE: ONLY extract businesses that have a phone number verified for WhatsApp communication. Look for 'wa.me' links or WhatsApp status icons in profiles." 
    : "";

  const newBizRule = params.onlyNewBusinesses
    ? "STRICT TEMPORAL CONSTRAINT: ONLY extract businesses that are NEWLY OPENED or RECENTLY STARTED (within the last 3-6 months). Look specifically for keywords like 'Grand Opening', 'Coming Soon', 'Newly Opened', 'Now Open', or businesses with extremely low review counts (less than 5 reviews). Verify social media creation dates where possible. REJECT established entities."
    : "";

  const prompt = `
    HIGH-FIDELITY EXTRACTION PROTOCOL:
    Target: "${params.query}" in "${params.city}, ${params.country}"
    Platform: ${platformConstraint}
    
    NEURAL FILTERS (STRICT ENFORCEMENT):
    ${noWebRule}
    ${waRule}
    ${newBizRule}

    INTELLIGENCE MANDATES:
    1. DEEP AUDIT: Use Google Search tool to verify details. 
    2. DISCARD RULE: Do not return leads that violate the NEURAL FILTERS. If Only New Businesses is on and you cannot find proof of recent start, discard the lead.
    3. DATA SET: For each lead, find: Company Name, Category, Verified Email, Direct Phone, Description, Growth Signals, Tech Stack (if any), Social Handles, Business Hours, Rating, reviewCount, address.
    4. CORPORATE INTELLIGENCE: Also extract (if discoverable):
       - Industry: Specific industry niche.
       - Company Size: Estimated headcount.
       - Revenue: Estimated annual revenue.
       - Funding: Current funding status.
    
    QUANTITY: Exactly ${targetQuantity} leads.
  `;

  try {
    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are the Cartel Scraper Lead Auditor. You strictly follow REJECTION RULES. You are an expert at identifying fresh startups and grand openings. If 'Only New Businesses' mode is active, you perform deep analysis of profile age and review history to ensure entity freshness. Output strictly JSON.`,
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
                businessHours: { type: Type.STRING },
                qualityScore: { type: Type.NUMBER },
                qualityReasoning: { type: Type.STRING },
                socialSignals: { type: Type.STRING },
                growthSignals: { type: Type.STRING },
                techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                lastActivity: { type: Type.STRING },
                verificationConfidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
                industry: { type: Type.STRING },
                companySize: { type: Type.STRING },
                annualRevenueEstimate: { type: Type.STRING },
                fundingStatus: { type: Type.STRING }
              },
              required: ["companyName", "category", "qualityScore"]
            }
          }
        }
      });
    });

    const rawLeads = extractJson(response.text ?? "");
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title || "Audit Link", uri: c.web.uri }));

    return rawLeads.map((item: any, index: number) => ({
      ...item,
      id: crypto.randomUUID(),
      generatedDate: new Date().toISOString(),
      searchCity: params.city,
      searchCountry: params.country,
      leadNumber: index + 1,
      status: 'new',
      contacted: false,
      sources: webSources.length > 0 ? webSources.slice(index % webSources.length, (index % webSources.length) + 1) : []
    }));
  } catch (err: any) {
    throw new Error(`Extraction Error: ${err.message}`);
  }
};

export const sendToWebhook = async (lead: Lead, webhookUrl: string): Promise<boolean> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: "lead_extraction", payload: lead }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
