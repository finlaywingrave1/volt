"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, User, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@auth0/nextjs-auth0"

// Discord SVG Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.4-2.172-1.27-2.172-1.27s.135.064.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.27.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34.002-.74.573-1.338 1.27-1.335zm-4.64 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34 0-.74.57-1.335 1.27-1.335z" />
  </svg>
)

interface NavigationButtonsProps {
  showVolumeToggle?: boolean
  onVolumeToggle?: () => void
  showVolumeRocker?: boolean
}

export function NavigationButtons({
  showVolumeToggle = true,
  onVolumeToggle,
  showVolumeRocker,
}: NavigationButtonsProps) {
  const { user, isLoading } = useUser()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    // Check if user has staff access from localStorage (temporary during migration)
    const storedIsStaff = localStorage.getItem("isStaff")
    setIsStaff(storedIsStaff === "true")
  }, [])

  const openDiscord = () => {
    window.open("https://discord.gg/GYyDGZxwSS", "_blank")
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }

  const handleMyProfile = () => {
    if (user?.sub) {
      window.location.href = `/profile?userID=${user.sub}`
    }
  }

  const handleSettings = () => {
    window.location.href = "/settings"
  }

  const handleLogout = () => {
    window.location.href = "/api/auth/logout"
  }

  const handleRequest = () => {
    window.location.href = "/request"
  }

  const handleMyVolt = () => {
    window.location.href = "/myvolt"
  }

  const handleJoinTheTeam = () => {
    window.location.href = "/apply"
  }

  const handleRecentlyPlayed = () => {
    window.location.href = "/recently-played"
  }

  const handleExitMyVolt = () => {
    window.location.href = "/"
  }

  return (
    <div className="flex items-center gap-2">
      {/* Login/Profile Button */}
      {user && !isLoading ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full p-1 w-10 h-10 flex items-center justify-center transition-all duration-200 hover:text-white/60 hover:bg-black/30"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.picture || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
            <DropdownMenuItem onClick={handleMyProfile} className="cursor-pointer hover:bg-white/10">
              <UserCircle className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer hover:bg-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={handleLogin}
          variant="ghost"
          size="sm"
          className="text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:text-white/60 hover:bg-black/30"
        >
          <User className="w-4 h-4" />
          <span className="text-xs font-medium">Login</span>
        </Button>
      )}

      {/* Volume Toggle Button - Only show if enabled */}
      {showVolumeToggle && onVolumeToggle && (
        <Button
          onClick={onVolumeToggle}
          variant="ghost"
          size="sm"
          className="text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all duration-200 hover:text-white/60 hover:bg-black/30"
        >
          {showVolumeRocker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      )}

      <Button
        onClick={handleRequest}
        variant="ghost"
        size="sm"
        className="text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:text-white/60 hover:bg-black/30"
      >
        <span className="text-xs font-medium">Request</span>
      </Button>

      {/* Other Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:text-white/60 hover:bg-black/30"
          >
            <span className="text-xs font-medium">Other</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-black/30 backdrop-blur-sm border-white/10 text-white/60 rounded-2xl"
        >
          <DropdownMenuItem
            onClick={handleRecentlyPlayed}
            className="cursor-pointer hover:bg-white/10 hover:text-white/60 rounded-xl"
          >
            Recently Played
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleJoinTheTeam}
            className="cursor-pointer hover:bg-white/10 hover:text-white/60 rounded-xl"
          >
            Join The Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MyVolt Button - Only show for staff */}
      {user && !isLoading && isStaff && (
        <Button
          onClick={handleMyVolt}
          variant="ghost"
          size="sm"
          className="text-white bg-blue-600 border border-blue-500 rounded-full px-4 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:bg-blue-700 hover:border-blue-600 shadow-lg shadow-blue-500/20"
        >
          <span className="text-sm font-semibold">MyVolt</span>
        </Button>
      )}

      {/* Exit MyVolt Button - Only show when on MyVolt pages */}
      {user &&
        !isLoading &&
        isStaff &&
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/myvolt") && (
          <Button
            onClick={handleExitMyVolt}
            variant="ghost"
            size="sm"
            className="text-white/60 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:bg-red-600/30 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Exit MyVolt</span>
          </Button>
        )}

      {/* Discord Button */}
      <Button
        onClick={openDiscord}
        variant="ghost"
        size="sm"
        className="text-white bg-purple-600 border border-purple-500 rounded-full px-3 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:bg-purple-600 hover:text-white"
      >
        <DiscordIcon className="w-4 h-4" />
        <span className="text-xs font-medium">Join our Discord</span>
      </Button>
    </div>
  )
}
