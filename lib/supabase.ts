import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      },
      roadmaps: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          learning_goal: string
          experience_level: string
          time_commitment: number
        },
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          learning_goal: string
          experience_level: string
          time_commitment: number
        },
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          learning_goal?: string
          experience_level?: string
          time_commitment?: number
        }
      }
    }
  }
}

