import { useGlobalStats, useHeatmapData } from '@/lib/selectors'
import { formatMinutes } from '@/lib/time'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import Heatmap from '@/components/Heatmap'
import ConsistencyChart from '@/components/ConsistencyChart'
import RecentLogs from '@/components/RecentLogs'

const MOTIVATIONAL_QUOTES = [
  "Discipline compounds.",
  "Progress is built one session at a time.",
  "Every hour invested today reduces uncertainty tomorrow.",
  "Consistency creates confidence.",
  "You become what you repeatedly do.",
]

export default function Dashboard() {
  const { lifetimeMinutes, todayMinutes, weekMinutes, monthMinutes, currentStreak, longestStreak } = useGlobalStats()
  const heatmapData = useHeatmapData()

  const quote = useMemo(() => {
    // Pick a quote based on the current day of the year so it changes daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Discipline OS</h1>
          <p className="text-xl text-muted-foreground italic font-light">{quote}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Current Streak</p>
          <p className="text-4xl font-bold text-primary">{currentStreak} <span className="text-xl text-muted-foreground">Days</span></p>
        </div>
      </div>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <KpiCard title="Today's Hours" value={formatMinutes(todayMinutes)} />
        <KpiCard title="Weekly Progress" value={formatMinutes(weekMinutes)} />
        <KpiCard title="Monthly Progress" value={formatMinutes(monthMinutes)} />
        <KpiCard title="Current Streak" value={`${currentStreak} d`} />
        <KpiCard title="Longest Streak" value={`${longestStreak} d`} />
        <KpiCard title="Total Lifetime" value={formatMinutes(lifetimeMinutes)} />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Consistency Heatmap</h2>
        <Card className="p-4 flex items-center justify-center bg-card/50 backdrop-blur-sm shadow-sm overflow-x-auto">
          <Heatmap dataMap={heatmapData} />
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight mt-8">30-Day Trend</h2>
        <Card className="p-4 bg-card/50 backdrop-blur-sm shadow-sm">
          <ConsistencyChart dataMap={heatmapData} />
        </Card>
      </div>

      <RecentLogs limit={5} />
    </div>
  )
}

function KpiCard({ title, value }: { title: string, value: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
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
