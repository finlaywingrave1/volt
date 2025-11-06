"use client"

import { BarChart3, Crown, Radio, TrendingUp, Users, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExecutiveSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function ExecutiveSidebar({ activeSection, onSectionChange }: ExecutiveSidebarProps) {
  const sections = [
    { id: "dashboard", label: "Dashboard", icon: Radio },
    { id: "listeners", label: "Listener Stats", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "requests", label: "Song Requests", icon: Zap },
  ]

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Executive
        </h2>
        <p className="text-xs text-slate-400">Strategic Overview</p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              "hover:bg-slate-800/50 text-left",
              activeSection === section.id
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "text-slate-300 hover:text-white",
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{section.label}</span>
          </button>
        )
      })}
    </div>
  )
}
