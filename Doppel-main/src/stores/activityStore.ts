import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ActivityLog {
  id: string
  type: 'draft' | 'suggestion' | 'approval' | 'training'
  title: string
  description: string
  confidence?: number
  timestamp: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
}

interface ActivityState {
  activities: ActivityLog[]
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void
  updateActivity: (id: string, updates: Partial<ActivityLog>) => void
  clearActivities: () => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      
      addActivity: (activity) =>
        set((state) => ({
          activities: [
            {
              ...activity,
              id: Date.now().toString(),
              timestamp: new Date().toISOString()
            },
            ...state.activities
          ].slice(0, 50) // Keep last 50 activities
        })),
      
      updateActivity: (id, updates) =>
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          )
        })),
      
      clearActivities: () => set({ activities: [] })
    }),
    {
      name: 'doppel-activity'
    }
  )
)
