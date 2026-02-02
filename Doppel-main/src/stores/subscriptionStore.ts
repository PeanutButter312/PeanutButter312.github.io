import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SubscriptionTier = 'free' | 'premium'

interface MessageUsage {
  count: number
  lastResetDate: string
}

interface SubscriptionState {
  tier: SubscriptionTier
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  messageUsage: MessageUsage

  // Actions
  setSubscription: (tier: SubscriptionTier, customerId?: string, subscriptionId?: string) => void
  incrementMessageCount: () => boolean // Returns false if limit reached
  resetDailyMessages: () => void
  canSendMessage: () => boolean
  getRemainingMessages: () => number
  isPremium: () => boolean
}

const FREE_DAILY_LIMIT = 4

const getTodayString = () => new Date().toISOString().split('T')[0]

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      messageUsage: {
        count: 0,
        lastResetDate: getTodayString()
      },

      setSubscription: (tier, customerId, subscriptionId) =>
        set({
          tier,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId
        }),

      incrementMessageCount: () => {
        const state = get()

        // Premium users have unlimited messages
        if (state.tier === 'premium') {
          return true
        }

        // Reset count if it's a new day
        const today = getTodayString()
        if (state.messageUsage.lastResetDate !== today) {
          set({ messageUsage: { count: 1, lastResetDate: today } })
          return true
        }

        // Check if free user has reached limit
        if (state.messageUsage.count >= FREE_DAILY_LIMIT) {
          return false
        }

        // Increment count
        set({
          messageUsage: {
            count: state.messageUsage.count + 1,
            lastResetDate: today
          }
        })
        return true
      },

      resetDailyMessages: () => {
        set({ messageUsage: { count: 0, lastResetDate: getTodayString() } })
      },

      canSendMessage: () => {
        const state = get()

        if (state.tier === 'premium') return true

        const today = getTodayString()
        if (state.messageUsage.lastResetDate !== today) return true

        return state.messageUsage.count < FREE_DAILY_LIMIT
      },

      getRemainingMessages: () => {
        const state = get()

        if (state.tier === 'premium') return -1 // -1 indicates unlimited

        const today = getTodayString()
        if (state.messageUsage.lastResetDate !== today) return FREE_DAILY_LIMIT

        return Math.max(0, FREE_DAILY_LIMIT - state.messageUsage.count)
      },

      isPremium: () => get().tier === 'premium'
    }),
    {
      name: 'echo-subscription'
    }
  )
)
