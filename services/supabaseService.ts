
import { supabase } from './supabaseClient.ts';
import { User, Lead, Invoice, Plan, SystemConfig } from '../types.ts';

export const db = {
  // Helper to check if a table exists
  async checkTable(table: string): Promise<boolean> {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error && (error.code === 'PGRST204' || error.message.includes('not find'))) return false;
    return true;
  },

  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST205') throw new Error("TABLE_MISSING: profiles");
        return null;
      }
      return data as User;
    } catch (e: any) {
      if (e.message.includes("TABLE_MISSING")) throw e;
      return null;
    }
  },

  async getAllProfiles(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data as User[];
  },

  async updateProfile(profile: Partial<User>) {
    const { error } = await supabase.from('profiles').upsert(profile);
    if (error) {
      if (error.message.includes("not find")) throw new Error("DATABASE_NOT_INITIALIZED");
      throw error;
    }
  },

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  },

  async updateUserSubscription(userId: string, subscription: any) {
    const { error } = await supabase.from('profiles').update({ subscription }).eq('id', userId);
    if (error) throw error;
  },

  async getLeads(userId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('userId', userId)
      .order('generatedDate', { ascending: false });
    
    if (error) return [];
    return data as Lead[];
  },

  async saveLeads(leads: Lead[]) {
    const { error } = await supabase.from('leads').upsert(leads);
    if (error) throw error;
  },

  async updateLeadStatus(leadId: string, status: string) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
    if (error) throw error;
  },

  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase.from('invoices').select('*').eq('userId', userId);
    if (error) return [];
    return data as Invoice[];
  },

  async getAllInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase.from('invoices').select('*').order('date', { ascending: false });
    if (error) return [];
    return data as Invoice[];
  },

  async addInvoice(invoice: Invoice) {
    const { error } = await supabase.from('invoices').insert(invoice);
    if (error) throw error;
  },

  async runAction(type: 'insert_row' | 'query', table: string, payload: any) {
    if (type === 'insert_row') {
      const { data, error } = await supabase.from(table).insert(payload).select();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase.from(table).select(payload.select || '*').limit(payload.limit || 10);
    if (error) throw error;
    return data;
  }
};
