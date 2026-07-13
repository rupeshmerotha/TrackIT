import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  },
}

export type Skill = {
  id: string
  name: string
  targetMinutes: number
  color: string
  createdAt: string
}

export type Log = {
  id: string
  skillId: string
  date: string // YYYY-MM-DD local time string
  minutes: number
  createdAt: string
}

interface AppState {
  skills: Skill[]
  logs: Log[]

  // Actions
  addSkill: (skill: Omit<Skill, "id" | "createdAt" | "color">) => void
  updateSkill: (id: string, updates: Partial<Omit<Skill, "id" | "createdAt" | "color">>) => void
  deleteSkill: (id: string) => void
  addLog: (log: Omit<Log, "id" | "createdAt">) => void
  updateLog: (id: string, updates: Partial<Omit<Log, "id" | "createdAt" | "skillId">>) => void
  deleteLog: (id: string) => void
}

// Generate a random distinct color for a new skill
const generateDistinctColor = (index: number) => {
  const hues = [210, 350, 150, 45, 280, 15, 180, 320, 75, 240];
  const hue = hues[index % hues.length];
  return `hsl(${hue}, 70%, 60%)`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      skills: [],
      logs: [],

      addSkill: (skill) => set((state) => ({
        skills: [...state.skills, {
          ...skill,
          id: crypto.randomUUID(),
          color: generateDistinctColor(state.skills.length),
          createdAt: new Date().toISOString()
        }]
      })),

      updateSkill: (id, updates) => set((state) => ({
        skills: state.skills.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),

      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter((s) => s.id !== id),
        logs: state.logs.filter((l) => l.skillId !== id)
      })),

      addLog: (log) => set((state) => {
        // If a log already exists for this skill on this date, we could add to it, but typically it's fine to have multiple logs per day, 
        // or we can aggregate them in selectors.
        return {
          logs: [...state.logs, {
            ...log,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
          }]
        }
      }),

      updateLog: (id, updates) => set((state) => ({
        logs: state.logs.map((l) => l.id === id ? { ...l, ...updates } : l)
      })),

      deleteLog: (id) => set((state) => ({
        logs: state.logs.filter((l) => l.id !== id)
      }))
    }),
    {
      name: 'discipline-os-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
