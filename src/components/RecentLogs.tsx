import { useAppStore } from '@/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { formatMinutes } from '@/lib/time'
import { format, parseISO, isToday, isYesterday } from 'date-fns'

export default function RecentLogs({ skillId, limit = 5 }: { skillId?: string, limit?: number }) {
  const allLogs = useAppStore(state => state.logs)
  const skills = useAppStore(state => state.skills)
  const deleteLog = useAppStore(state => state.deleteLog)

  const logs = skillId ? allLogs.filter(l => l.skillId === skillId) : allLogs
  const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)

  if (sortedLogs.length === 0) return null

  const getDayLabel = (dateStr: string) => {
    const d = parseISO(dateStr)
    if (isToday(d)) return "Today"
    if (isYesterday(d)) return "Yesterday"
    return format(d, 'MMM d, yyyy')
  }

  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
      <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {sortedLogs.map(log => {
            const skill = skills.find(s => s.id === log.skillId)
            if (!skill) return null
            
            return (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors group">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {!skillId && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }} />
                    )}
                    {skill.name} <span className="text-muted-foreground font-normal ml-2">{formatMinutes(log.minutes)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Logged {getDayLabel(log.date)}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this log?")) {
                      deleteLog(log.id)
                    }
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
