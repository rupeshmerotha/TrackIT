import { useState } from 'react'
import { useAppStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { parseTimeInput, formatMinutes } from '@/lib/time'

export default function Skills() {
  const skills = useAppStore(state => state.skills)
  const addSkill = useAppStore(state => state.addSkill)
  const deleteSkill = useAppStore(state => state.deleteSkill)
  const navigate = useNavigate()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [targetTime, setTargetTime] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    setError('')
    if (!name.trim()) {
      setError('Skill name is required.')
      return
    }
    const minutes = parseTimeInput(targetTime)
    if (!minutes || minutes <= 0) {
      setError('Please enter a valid target time (e.g. 500 h, 2 h 30 min).')
      return
    }

    addSkill({ name: name.trim(), targetMinutes: minutes })
    setName('')
    setTargetTime('')
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground mt-2">Manage what you track.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed rounded-lg bg-card/10">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No skills yet</h3>
            <p className="text-sm text-muted-foreground/80 mb-6">Create a skill to start logging time.</p>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>Create your first skill</Button>
          </div>
        ) : (
          skills.map((skill, i) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col group bg-card/50 backdrop-blur-sm relative"
                onClick={() => navigate(`/skills/${skill.id}`)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive text-muted-foreground h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm("Are you sure you want to delete this skill? All associated time logs will also be permanently deleted.")) {
                      deleteSkill(skill.id)
                    }
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
                <CardHeader className="pb-3 pr-10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: skill.color }} />
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{skill.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  <CardDescription className="flex justify-between items-center mt-4">
                    <span>Target</span>
                    <span className="font-medium text-foreground">{formatMinutes(skill.targetMinutes)}</span>
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>
              Create a new skill to track your progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                placeholder="e.g. DSA, Reading, Gym"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">Target Time</Label>
              <Input
                id="target"
                placeholder="e.g. 500 h, 30 min"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                }}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
