import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Project = {
  id: string;
  user_id: string;
  address: string;
  lat: number;
  lng: number;
  polygon: [number, number][];
  panels: any[];
  system_kw: number;
  annual_kwh: number;
  created_at: string;
  roof_image_url?: string;
};

export type MaintenanceTicket = {
  id: string;
  project_id: string;
  user_id: string;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  image_url?: string;
  created_at: string;
};
