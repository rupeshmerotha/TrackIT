import { useMemo } from 'react'
import { subDays, format, getDay, eachDayOfInterval } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatMinutes } from '@/lib/time'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

export default function Heatmap({ dataMap, skillId }: { dataMap: Map<string, { minutes: number, skillIds: Set<string> }>, skillId?: string }) {
  const skills = useAppStore(state => state.skills)

  const days = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 364) // Last 365 days (including today)
    const interval = eachDayOfInterval({ start, end })

    // Pad the beginning so the first column starts on a Sunday (0)
    const firstDayOfWeek = getDay(start)
    const padding = Array.from({ length: firstDayOfWeek }).map((_, i) => {
      return { date: null, dateStr: '', minutes: 0, skillIds: new Set<string>() }
    })

    const actualDays = interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const entry = dataMap.get(dateStr)
      return {
        date,
        dateStr,
        minutes: entry?.minutes || 0,
        skillIds: entry?.skillIds || new Set<string>()
      }
    })

    return [...padding, ...actualDays]
  }, [dataMap])

  // Group by weeks (columns)
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7))
    }
    return w
  }, [days])

  return (
    <div className="flex w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-1 min-w-max">
        <TooltipProvider delayDuration={0}>
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((day, dIndex) => {
                if (!day.date) {
                  return <div key={`pad-${dIndex}`} className="w-3 h-3 bg-transparent rounded-sm" />
                }

                // Determine color intensity
                let bgColor = "bg-muted/30"
                if (day.minutes > 0 && day.minutes < 60) bgColor = "bg-primary/30"
                else if (day.minutes >= 60 && day.minutes < 120) bgColor = "bg-primary/50"
                else if (day.minutes >= 120 && day.minutes < 240) bgColor = "bg-primary/70"
                else if (day.minutes >= 240) bgColor = "bg-primary"

                const workedSkills = Array.from(day.skillIds)
                  .map(id => skills.find(s => s.id === id)?.name)
                  .filter(Boolean)
                  .join(', ')

                return (
                  <Tooltip key={day.dateStr}>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn("w-3 h-3 rounded-[2px] transition-colors cursor-crosshair", bgColor)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground border border-border shadow-lg z-50">
                      <div className="text-xs font-semibold">{format(day.date, 'MMM d, yyyy')}</div>
                      <div className="text-sm font-bold text-primary">{day.minutes === 0 ? 'No activity' : formatMinutes(day.minutes)}</div>
                      {workedSkills && (
                        <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                          {workedSkills}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}
