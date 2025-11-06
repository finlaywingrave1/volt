"use client"

import { Users, Zap, Settings, FileText, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ManagementSidebarProps {
  activeSection: "users" | "staff" | "encoders" | "applications" | "djbible"
  onSectionChange: (section: "users" | "staff" | "encoders" | "applications" | "djbible") => void
}

export function ManagementSidebar({ activeSection, onSectionChange }: ManagementSidebarProps) {
  const sections = [
    {
      id: "users" as const,
      label: "User Manager",
      icon: Users,
      description: "Manage user accounts and roles",
      onClick: () => onSectionChange("users"),
    },
    {
      id: "staff" as const,
      label: "Staff Manager",
      icon: Settings,
      description: "Manage staff members",
      onClick: () => onSectionChange("staff"),
    },
    {
      id: "encoders" as const,
      label: "Encoder Manager",
      icon: Zap,
      description: "Manage encoding servers",
      onClick: () => onSectionChange("encoders"),
    },
    {
      id: "applications" as const,
      label: "Applications",
      icon: FileText,
      description: "View pending applications",
      onClick: () => onSectionChange("applications"),
    },
    {
      id: "djbible" as const,
      label: "DJ Bible Manager",
      icon: BookOpen,
      description: "Manage DJ Bible pages",
      onClick: () => onSectionChange("djbible"),
    },
  ]

  return (
    <div className="flex flex-col gap-2 w-full h-fit bg-white/5 rounded-2xl border border-white/10 p-4">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id

        return (
          <Button
            key={section.id}
            onClick={section.onClick}
            className={cn(
              "justify-start gap-3 h-auto py-3 px-4 transition-all",
              isActive
                ? "bg-purple-600/40 border border-purple-500/50 text-white hover:bg-purple-600/50"
                : "bg-transparent border border-transparent text-white/70 hover:bg-white/10 hover:border-white/20",
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="text-sm font-semibold">{section.label}</div>
              <div className="text-xs text-white/50">{section.description}</div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
