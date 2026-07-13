import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import { useSkillStats, useHeatmapData } from '@/lib/selectors'
import { formatMinutes } from '@/lib/time'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Heatmap from '@/components/Heatmap'
import RecentLogs from '@/components/RecentLogs'

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const skill = useAppStore(state => state.skills.find(s => s.id === id))
  
  // Call the hook at the top level
  const stats = useSkillStats(id || '')
  const heatmapData = useHeatmapData(id)

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <p>Skill not found</p>
        <Button variant="outline" onClick={() => navigate('/skills')}>Back to Skills</Button>
      </div>
    )
  }

  const { lifetimeMinutes, weekMinutes, monthMinutes, currentStreak, longestStreak } = stats
  
  const targetMinutes = skill.targetMinutes
  const progressPercent = Math.min(100, Math.round((lifetimeMinutes / targetMinutes) * 100))

  return (
    <div className="space-y-8 pb-10">
      <div>
        <Button variant="ghost" className="-ml-4 mb-4 gap-2 text-muted-foreground" onClick={() => navigate('/skills')}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: skill.color }} />
          <h1 className="text-3xl font-bold tracking-tight">{skill.name}</h1>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Progress towards goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-bold">{formatMinutes(lifetimeMinutes)}</span>
            <span className="text-muted-foreground font-medium">{formatMinutes(skill.targetMinutes)} Target</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%`, backgroundColor: skill.color }} 
            />
          </div>
          <p className="text-right text-xs mt-2 text-muted-foreground font-medium">{progressPercent}% Completed</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Weekly Trend" value={formatMinutes(weekMinutes)} delay={0.1} />
        <StatCard title="Monthly Trend" value={formatMinutes(monthMinutes)} delay={0.2} />
        <StatCard title="Current Streak" value={`${currentStreak} d`} delay={0.3} />
        <StatCard title="Longest Streak" value={`${longestStreak} d`} delay={0.4} />
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-semibold tracking-tight">Consistency Heatmap</h2>
        <Card className="p-4 flex items-center justify-center bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
             <Heatmap dataMap={heatmapData} skillId={skill.id} />
        </Card>
      </div>
      
      <RecentLogs skillId={skill.id} limit={10} />
    </div>
  )
}

function StatCard({ title, value, delay }: { title: string, value: string, delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
