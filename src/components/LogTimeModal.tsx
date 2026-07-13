import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store'
import { parseTimeInput } from '@/lib/time'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function LogTimeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const skills = useAppStore((state) => state.skills)
  const addLog = useAppStore((state) => state.addLog)
  const navigate = useNavigate()

  const [skillId, setSkillId] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    setError('')
    
    if (!skillId) {
      setError('Please select a skill.')
      return
    }
    
    const minutes = parseTimeInput(timeInput)
    if (!minutes || minutes <= 0) {
      setError('Please enter a valid time (e.g. "2 h", "90 min", "45 min").')
      return
    }

    addLog({
      skillId,
      date: format(new Date(), 'yyyy-MM-dd'),
      minutes,
    })

    // Reset and close
    setSkillId('')
    setTimeInput('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
          <DialogDescription>
            Invest time in your skills. Consistency is key.
          </DialogDescription>
        </DialogHeader>

        {skills.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-muted-foreground">You don't have any skills tracked yet.</p>
            <Button onClick={() => {
              onOpenChange(false)
              navigate('/skills')
            }}>
              Create a Skill
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skill">Skill</Label>
              <select 
                id="skill" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
              >
                <option value="" disabled>Select a skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                placeholder="e.g. 2 h, 90 min"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSave()
                  }
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Log</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
