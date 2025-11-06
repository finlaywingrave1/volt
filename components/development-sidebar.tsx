"use client"

import { Code, Database, FileText, Radio, Settings, Users, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface DevelopmentSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DevelopmentSidebar({ activeSection, onSectionChange }: DevelopmentSidebarProps) {
  const sections = [
    { id: "overview", label: "Overview", icon: Radio },
    { id: "station", label: "Station Info", icon: Database },
    { id: "files", label: "File Manager", icon: FileText },
    { id: "playlists", label: "Playlists", icon: Zap },
    { id: "podcasts", label: "Podcasts", icon: Users },
    { id: "logs", label: "System Logs", icon: Settings },
    { id: "debug", label: "Debug Console", icon: Code },
  ]

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Development</h2>
        <p className="text-xs text-slate-400">Technical Controls</p>
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
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
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
