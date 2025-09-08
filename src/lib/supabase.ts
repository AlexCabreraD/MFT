import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          clerk_user_id: string
          created_at: string
          updated_at: string
          preferences: Record<string, unknown> | null
        }
        Insert: {
          id?: string
          clerk_user_id: string
          created_at?: string
          updated_at?: string
          preferences?: Record<string, unknown> | null
        }
        Update: {
          id?: string
          clerk_user_id?: string
          created_at?: string
          updated_at?: string
          preferences?: Record<string, unknown> | null
        }
      }
      hour_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          type: 'clinical' | 'supervision' | 'ce'
          subtype: string | null
          hours: string
          notes: string | null
          reviewed_audio: boolean
          reviewed_video: boolean
          ce_category: 'general' | 'ethics-law-tech' | 'suicide-prevention' | 'mft-specific' | null
          delivery_format: 'in-person' | 'online' | null
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          type: 'clinical' | 'supervision' | 'ce'
          subtype?: string | null
          hours: string
          notes?: string | null
          reviewed_audio?: boolean
          reviewed_video?: boolean
          ce_category?: 'general' | 'ethics-law-tech' | 'suicide-prevention' | 'mft-specific' | null
          delivery_format?: 'in-person' | 'online' | null
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          type?: 'clinical' | 'supervision' | 'ce'
          subtype?: string | null
          hours?: string
          notes?: string | null
          reviewed_audio?: boolean
          reviewed_video?: boolean
          ce_category?: 'general' | 'ethics-law-tech' | 'suicide-prevention' | 'mft-specific' | null
          delivery_format?: 'in-person' | 'online' | null
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}