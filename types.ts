
export interface Lead {
  id: string;
  userId?: string;
  generatedDate: string;
  searchCity: string;
  searchCountry: string;
  leadNumber: number;
  companyName: string;
  category: string;
  city: string;
  country: string;
  coordinates: string;
  website: string;
  phoneNumber: string;
  email: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  description: string;
  rating: string;
  reviewCount: string;
  address: string;
  businessHours: string;
  qualityScore: number;
  qualityReasoning: string;
  status: 'new' | 'processed' | 'error';
  contacted: boolean;
  sources?: { title: string; uri: string }[];
  socialSignals?: string; // e.g., "Active on IG", "Verified GMB"
  verificationConfidence?: 'high' | 'medium' | 'low';
}

export type Platform = 'all' | 'instagram' | 'linkedin' | 'facebook' | 'x' | 'google_maps' | 'google_search' | 'yelp' | 'yellow_pages' | 'clutch' | 'trustpilot';

export interface SearchParams {
  query: string;
  city: string;
  country: string;
  platform: Platform;
  quantity: string;
  noWebsiteOnly: boolean;
  whatsappOnly: boolean;
}

export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  leadLimit: number;
  features: string[];
  recommended?: boolean;
  isActive: boolean;
}

export interface UserSubscription {
  planId: string;
  cycle: BillingCycle;
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'past_due';
  trialEndDate?: string;
  nextBillingDate: string;
  leadsUsedThisMonth: number;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  enabled: boolean;
  logs: WebhookLog[];
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  statusCode: number;
  payloadSize: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  gstNumber?: string;
  billingAddress?: string;
  subscription: UserSubscription;
  webhook: WebhookConfig;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  gstAmount: number;
  total: number;
  planName: string;
  status: 'paid' | 'unpaid';
  transactionId: string;
  billingPeriod: string;
  userId: string;
}

export interface SystemConfig {
  freeTrialEnabled: boolean;
  trialDurationDays: number;
  trialLeadLimit: number;
  gstPercentage: number;
  platformBranding: {
    name: string;
    tagline: string;
    primaryColor: string;
  };
  companyDetails: {
    name: string;
    address: string;
    gst: string;
    logo: string;
  };
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: string;
}
