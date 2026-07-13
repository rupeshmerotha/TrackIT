import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export default function ConsistencyChart({ dataMap }: { dataMap: Map<string, { minutes: number }> }) {
  const data = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 30) // Last 30 days
    const interval = eachDayOfInterval({ start, end })
    
    return interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return {
        name: format(date, 'MMM dd'),
        hours: (dataMap.get(dateStr)?.minutes || 0) / 60
      }
    })
  }, [dataMap])

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            minTickGap={30}
          />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover text-popover-foreground border border-border shadow-lg p-3 rounded-md z-50">
                    <p className="text-sm font-semibold">{payload[0].payload.name}</p>
                    <p className="text-sm font-bold text-primary">{Number(payload[0].value).toFixed(1)} Hours</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line 
            type="monotone" 
            dataKey="hours" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
