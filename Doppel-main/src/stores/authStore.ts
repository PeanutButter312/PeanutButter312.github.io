import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PersonalityProfile {
  formalCasual: number // 0-100
  shortDetailed: number
  politeDirect: number
  emotionalLogical: number
  trainingSamples: string[]
  learningProgress: number
}

interface AuthState {
  isOnboarded: boolean
  userName: string
  personality: PersonalityProfile
  setOnboarded: (name: string, personality: PersonalityProfile) => void
  updatePersonality: (personality: Partial<PersonalityProfile>) => void
  addTrainingSample: (sample: string) => void
}

const defaultPersonality: PersonalityProfile = {
  formalCasual: 50,
  shortDetailed: 50,
  politeDir: 50,
  emotionalLogical: 50,
  trainingSamples: [],
  learningProgress: 0
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      userName: '',
      personality: defaultPersonality,
      
      setOnboarded: (name, personality) => 
        set({ isOnboarded: true, userName: name, personality }),
      
      updatePersonality: (personality) =>
        set((state) => ({
          personality: { ...state.personality, ...personality }
        })),
      
      addTrainingSample: (sample) =>
        set((state) => ({
          personality: {
            ...state.personality,
            trainingSamples: [...state.personality.trainingSamples, sample],
            learningProgress: Math.min(
              state.personality.learningProgress + 10,
              100
            )
          }
        }))
    }),
    {
      name: 'doppel-auth'
    }
  )
)
