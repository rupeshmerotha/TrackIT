import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Target, History, Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import LogTimeModal from '@/components/LogTimeModal'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Target, label: 'Skills', path: '/skills' },
]

export default function AppLayout() {
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-border bg-card/30 flex flex-col items-center md:items-stretch py-6 transition-all">
        <div className="px-4 mb-8 hidden md:block">
          <h1 className="font-semibold text-lg tracking-tight">Discipline OS</h1>
        </div>
        
        <nav className="flex-1 px-2 space-y-2 w-full flex flex-col items-center md:items-stretch">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden md:block text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 md:p-4 mt-auto">
          <Button 
            onClick={() => setIsLogTimeOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-full shadow-lg hover:shadow-primary/25 transition-shadow"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:block">Log Time</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-full">
          <Outlet />
        </div>
      </main>

      <LogTimeModal open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen} />
    </div>
  )
}
