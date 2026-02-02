import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'premium'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface MessageUsage {
  id: string
  user_id: string
  date: string
  message_count: number
  created_at: string
  updated_at: string
}
