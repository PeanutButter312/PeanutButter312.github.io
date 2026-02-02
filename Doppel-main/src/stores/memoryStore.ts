import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MemoryItem {
  id: string
  type: 'person' | 'preference' | 'rule' | 'context'
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface MemoryState {
  memories: MemoryItem[]
  addMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMemory: (id: string, updates: Partial<MemoryItem>) => void
  deleteMemory: (id: string) => void
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      memories: [
        {
          id: '1',
          type: 'person',
          title: 'Mom',
          content: 'Always responds warmly. Prefers calls over texts for important things.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'rule',
          title: 'Never book mornings',
          content: 'Not a morning person. Decline any meetings before 10 AM.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'preference',
          title: 'Email style',
          content: 'Keep professional emails concise. Use casual tone with team.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      
      addMemory: (memory) =>
        set((state) => ({
          memories: [
            ...state.memories,
            {
              ...memory,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        })),
      
      updateMemory: (id, updates) =>
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          )
        })),
      
      deleteMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id)
        }))
    }),
    {
      name: 'doppel-memory'
    }
  )
)
