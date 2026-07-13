import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { Log } from '@/store'
import {
  parseISO,
  isToday,
  isSameWeek,
  isSameMonth,
  differenceInDays,
  startOfDay,
  subDays,
  format,
} from 'date-fns'

// Helper to group logs by local date string (YYYY-MM-DD)
export const getLogsByDate = (logs: Log[]) => {
  const map = new Map<string, Log[]>()
  for (const log of logs) {
    if (!map.has(log.date)) {
      map.set(log.date, [])
    }
    map.get(log.date)!.push(log)
  }
  return map
}

// Global Selectors
export const useGlobalStats = () => {
  const allLogs = useAppStore((state) => state.logs)
  
  return useMemo(() => {
    let lifetimeMinutes = 0
    let todayMinutes = 0
    let weekMinutes = 0
    let monthMinutes = 0

    const now = new Date()

    allLogs.forEach((log) => {
      lifetimeMinutes += log.minutes
      
      const logDate = parseISO(log.date)
      
      if (isToday(logDate)) {
        todayMinutes += log.minutes
      }
      
      if (isSameWeek(logDate, now)) {
        weekMinutes += log.minutes
      }
      
      if (isSameMonth(logDate, now)) {
        monthMinutes += log.minutes
      }
    })

    const logsByDate = getLogsByDate(allLogs)
    const sortedDates = Array.from(logsByDate.keys()).sort((a, b) => b.localeCompare(a))

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    const ascDates = [...sortedDates].reverse()
    ascDates.forEach((dateStr) => {
      const d = parseISO(dateStr)
      if (!lastDate) {
        tempStreak = 1
      } else {
        const diff = differenceInDays(d, lastDate)
        if (diff === 1) {
          tempStreak++
        } else if (diff > 1) {
          tempStreak = 1
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
      lastDate = d
    })

    let checkDate = startOfDay(now)
    const todayStr = format(checkDate, 'yyyy-MM-dd')
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd')
    
    if (logsByDate.has(todayStr) || logsByDate.has(yesterdayStr)) {
      let d = logsByDate.has(todayStr) ? checkDate : subDays(checkDate, 1)
      while (logsByDate.has(format(d, 'yyyy-MM-dd'))) {
        currentStreak++
        d = subDays(d, 1)
      }
    }

    return {
      lifetimeMinutes,
      todayMinutes,
      weekMinutes,
      monthMinutes,
      currentStreak,
      longestStreak
    }
  }, [allLogs])
}

// Skill-specific stats
export const useSkillStats = (skillId: string) => {
  const allLogs = useAppStore((state) => state.logs)

  return useMemo(() => {
    const logs = allLogs.filter(l => l.skillId === skillId)
    let lifetimeMinutes = 0
    let todayMinutes = 0
    let weekMinutes = 0
    let monthMinutes = 0

    const now = new Date()

    logs.forEach((log) => {
      lifetimeMinutes += log.minutes
      const logDate = parseISO(log.date)
      if (isToday(logDate)) todayMinutes += log.minutes
      if (isSameWeek(logDate, now)) weekMinutes += log.minutes
      if (isSameMonth(logDate, now)) monthMinutes += log.minutes
    })

    const logsByDate = getLogsByDate(logs)
    const sortedDates = Array.from(logsByDate.keys()).sort((a, b) => a.localeCompare(b))

    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    sortedDates.forEach((dateStr) => {
      const d = parseISO(dateStr)
      if (!lastDate) {
        tempStreak = 1
      } else {
        const diff = differenceInDays(d, lastDate)
        if (diff === 1) {
          tempStreak++
        } else if (diff > 1) {
          tempStreak = 1
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
      lastDate = d
    })

    let currentStreak = 0
    let checkDate = startOfDay(now)
    const todayStr = format(checkDate, 'yyyy-MM-dd')
    const yesterdayStr = format(subDays(checkDate, 1), 'yyyy-MM-dd')
    
    if (logsByDate.has(todayStr) || logsByDate.has(yesterdayStr)) {
      let d = logsByDate.has(todayStr) ? checkDate : subDays(checkDate, 1)
      while (logsByDate.has(format(d, 'yyyy-MM-dd'))) {
        currentStreak++
        d = subDays(d, 1)
      }
    }

    return {
      lifetimeMinutes,
      todayMinutes,
      weekMinutes,
      monthMinutes,
      currentStreak,
      longestStreak
    }
  }, [allLogs, skillId])
}

// Heatmap Data Selector
export const useHeatmapData = (skillId?: string) => {
  const allLogs = useAppStore((state) => state.logs)
  
  return useMemo(() => {
    const logs = skillId ? allLogs.filter(l => l.skillId === skillId) : allLogs
    const logsByDate = getLogsByDate(logs)
    
    const heatmap = new Map<string, { minutes: number, skillIds: Set<string> }>()
    
    for (const [date, dayLogs] of logsByDate.entries()) {
      let total = 0
      const skills = new Set<string>()
      dayLogs.forEach(l => {
        total += l.minutes
        skills.add(l.skillId)
      })
      heatmap.set(date, { minutes: total, skillIds: skills })
    }
    
    return heatmap
  }, [allLogs, skillId])
}
