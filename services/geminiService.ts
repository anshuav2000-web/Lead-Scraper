
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
    const parsed = JSON.parse(text);
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
    const objectMatch = text.match(/\{\s*[\s\S]*\}\s*/);
    if (objectMatch) {
      try {
        return [JSON.parse(objectMatch[0])];
      } catch (innerE) {
        console.error("Failed to parse regex-extracted object", innerE);
      }
    }
    throw new Error("AI output was not valid JSON. Please try again or refine the query.");
  }
};

export const searchLeads = async (params: SearchParams): Promise<Lead[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. If you are on Netlify, please set the 'API_KEY' variable in Site Configuration > Environment Variables and re-deploy.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const platformContext = getPlatformInstruction(params.platform);
  const targetQuantity = params.quantity === 'unlimited' ? '20' : params.quantity;

  const noWebsiteConstraint = params.noWebsiteOnly 
    ? "MANDATORY: Return ONLY businesses that do NOT have a website."
    : "Include businesses with or without websites.";

  const whatsappConstraint = params.whatsappOnly
    ? "WHATSAPP: Prioritize mobile numbers and businesses mentioning WhatsApp availability."
    : "";

  const prompt = `
    Find exactly ${targetQuantity} leads for "${params.query}" in "${params.city}, ${params.country}".
    Source focus: ${platformContext}.
    ${noWebsiteConstraint}
    ${whatsappConstraint}
    
    Verify business activity. Return a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the LeadScrape Architect. You extract accurate business data including Phone, Email, Socials. QualityScore must be 0-100. Return valid JSON only.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 15000 },
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

    const generatedText = response.text ?? "";
    const rawLeads = extractJson(generatedText);
    const today = new Date().toISOString();
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
      qualityScore: Number(item.qualityScore) || 70,
      sources: webSources.length > 0 ? webSources.slice(index % webSources.length, (index % webSources.length) + 2) : []
    }));
  } catch (err: any) {
    throw new Error(`Extraction Engine Error: ${err.message}`);
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
        lead: {
          ...lead,
          syncTime: new Date().toISOString()
        }
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Webhook Dispatch Failed:", error);
    return false;
  }
};
