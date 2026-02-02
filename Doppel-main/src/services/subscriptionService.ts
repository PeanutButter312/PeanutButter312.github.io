import { supabase } from '@/lib/supabase'
import axios from 'axios'

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY

// Create Stripe checkout session
export async function createCheckoutSession(userId: string, email: string) {
  try {
    // In production, this should be done from your backend
    // For now, we'll create a simple implementation
    const response = await axios.post(
      'https://api.stripe.com/v1/checkout/sessions',
      new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'customer_email': email,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': 'Echo Premium',
        'line_items[0][price_data][product_data][description]': 'Unlimited messages and premium features',
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][price_data][unit_amount]': '999', // $9.99
        'line_items[0][quantity]': '1',
        'success_url': `${window.location.origin}/subscription/success`,
        'cancel_url': `${window.location.origin}/settings`,
        'metadata[user_id]': userId,
      }),
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Get subscription details from Supabase
export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching subscription:', error)
    throw error
  }

  return data
}

// Create or update subscription in Supabase
export async function upsertSubscription(subscription: {
  user_id: string
  tier: 'free' | 'premium'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status?: string
  current_period_end?: string
}) {
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(subscription, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  return data
}

// Track message usage
export async function incrementMessageUsage(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  // Try to update existing record
  const { data: existing } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('message_usage')
      .update({ message_count: existing.message_count + 1 })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('message_usage')
      .insert({ user_id: userId, date: today, message_count: 1 })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Get today's message count
export async function getTodayMessageCount(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('message_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return data?.message_count || 0
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await axios.delete(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}
