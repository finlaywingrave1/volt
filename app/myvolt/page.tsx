"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { Radio, LogOut, Users, Crown, AlertCircle, Shield, Sparkles, UserX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DJSession {
  DJID: string
  UserID: string
  DJName: string
  Username: string
  ProfilePicture: string
  AccessLevel: string
  Status?: string
}

export default function MyVoltPage() {
  const router = useRouter()
  const [djSession, setDjSession] = useState<DJSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInternalUser, setSelectedInternalUser] = useState<string>("")
  const [internalPassword, setInternalPassword] = useState("")
  const [internalLoginLoading, setInternalLoginLoading] = useState(false)
  const [internalLoginError, setInternalLoginError] = useState<string | null>(null)
  const [isInternalUser, setIsInternalUser] = useState(false)
  const [regularUserData, setRegularUserData] = useState<DJSession | null>(null)

  const handleLogout = () => {
    localStorage.removeItem("dj_Username")
    localStorage.removeItem("dj_DJID")
    localStorage.removeItem("dj_UserID")
    localStorage.removeItem("dj_DJName")
    localStorage.removeItem("dj_ProfilePicture")
    localStorage.removeItem("dj_AccessLevel")
    localStorage.removeItem("dj_Status")
    router.push("/myvolt/login")
  }

  const handleInternalUserLogin = async () => {
    if (!selectedInternalUser || !internalPassword) {
      setInternalLoginError("Please select a user and enter a password")
      return
    }

    setInternalLoginLoading(true)
    setInternalLoginError(null)

    try {
      if (djSession && !djSession.Username.startsWith("VOLT_")) {
        const backupData = {
          DJID: djSession.DJID,
          UserID: djSession.UserID,
          DJName: djSession.DJName,
          Username: djSession.Username,
          ProfilePicture: djSession.ProfilePicture,
          AccessLevel: djSession.AccessLevel,
          Status: djSession.Status || "Active",
        }
        localStorage.setItem("regular_user_backup", JSON.stringify(backupData))
      }

      const response = await fetch("https://api.finlayw.cloud/v1/volt/dj/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        body: JSON.stringify({
          Username: selectedInternalUser,
          Password: internalPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Invalid password for internal user")
      }

      const data = await response.json()

      localStorage.setItem("dj_DJID", data.DJID.toString())
      localStorage.setItem("dj_UserID", data.UserID.toString())
      localStorage.setItem("dj_DJName", data.DJName)
      localStorage.setItem("dj_Username", data.Username)
      localStorage.setItem("dj_ProfilePicture", data.ProfilePicture)
      localStorage.setItem("dj_AccessLevel", data.AccessLevel)
      localStorage.setItem("dj_Status", data.Status || "Active")

      window.location.reload()
    } catch (err) {
      setInternalLoginError(err instanceof Error ? err.message : "Failed to login as internal user")
    } finally {
      setInternalLoginLoading(false)
    }
  }

  const handleSwitchBackToRegular = () => {
    if (regularUserData) {
      localStorage.setItem("dj_DJID", regularUserData.DJID)
      localStorage.setItem("dj_UserID", regularUserData.UserID)
      localStorage.setItem("dj_DJName", regularUserData.DJName)
      localStorage.setItem("dj_Username", regularUserData.Username)
      localStorage.setItem("dj_ProfilePicture", regularUserData.ProfilePicture)
      localStorage.setItem("dj_AccessLevel", regularUserData.AccessLevel)
      localStorage.setItem("dj_Status", regularUserData.Status || "Active")
      localStorage.removeItem("regular_user_backup")
      window.location.reload()
    }
  }

  useEffect(() => {
    const fetchDJStatus = async () => {
      const username = localStorage.getItem("dj_Username")

      if (!username) {
        router.push("/myvolt/login")
        return
      }

      const isInternal = username.startsWith("VOLT_")
      setIsInternalUser(isInternal)

      if (isInternal) {
        const backupData = localStorage.getItem("regular_user_backup")
        if (backupData) {
          setRegularUserData(JSON.parse(backupData))
        }
      }

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`https://api.finlayw.cloud/v1/volt/dj/get/${username}`, {
          headers: {
            Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          router.push("/myvolt/login")
          return
        }

        const data = await response.json()

        localStorage.setItem("dj_DJID", data.DJID?.toString() || "")
        localStorage.setItem("dj_UserID", data.UserID?.toString() || "")
        localStorage.setItem("dj_DJName", data.DJName || "")
        localStorage.setItem("dj_Username", data.Username || "")
        localStorage.setItem("dj_ProfilePicture", data.ProfilePicture || "")
        localStorage.setItem("dj_AccessLevel", data.AccessLevel || "")
        localStorage.setItem("dj_Status", data.Status || "Active")

        setDjSession({
          DJID: data.DJID?.toString() || "",
          UserID: data.UserID?.toString() || "",
          DJName: data.DJName || "",
          Username: data.Username || "",
          ProfilePicture: data.ProfilePicture || "",
          AccessLevel: data.AccessLevel || "",
          Status: data.Status || "Active",
        })
        setIsLoading(false)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.error("DJ status fetch timeout")
        } else {
          console.error("Error fetching DJ status:", error)
        }
        const cachedUsername = localStorage.getItem("dj_Username")
        const cachedDJID = localStorage.getItem("dj_DJID")

        if (cachedUsername && cachedDJID) {
          setDjSession({
            DJID: localStorage.getItem("dj_DJID") || "",
            UserID: localStorage.getItem("dj_UserID") || "",
            DJName: localStorage.getItem("dj_DJName") || "",
            Username: cachedUsername,
            ProfilePicture: localStorage.getItem("dj_ProfilePicture") || "",
            AccessLevel: localStorage.getItem("dj_AccessLevel") || "",
            Status: localStorage.getItem("dj_Status") || "Active",
          })
          setIsLoading(false)
        } else {
          router.push("/myvolt/login")
        }
      }
    }

    fetchDJStatus()
  }, [router])

  const getStatusInfo = (status: string, accessLevel: string) => {
    if (status === "Suspended") {
      return { color: "red", bgColor: "bg-red-600/20", textColor: "text-red-400", badge: "Suspended" }
    }

    if (status === "Moderator") {
      return { color: "orange", bgColor: "bg-orange-600/20", textColor: "text-orange-400", badge: "Moderator" }
    }

    if (status === "Developer") {
      return { color: "coral", bgColor: "bg-orange-600/20", textColor: "text-orange-400", badge: "Developer" }
    }

    if (accessLevel === "DJ") {
      return { color: "blue", bgColor: "bg-blue-600/20", textColor: "text-blue-400", badge: "DJ" }
    } else {
      return { color: "green", bgColor: "bg-green-600/20", textColor: "text-green-400", badge: "Staff" }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!djSession) {
    return null
  }

  const statusInfo = getStatusInfo(djSession.Status || "Active", djSession.AccessLevel)
  const isSuspended = djSession.Status === "Suspended"
  const hasNoAccessLevel = !djSession.AccessLevel || djSession.AccessLevel === "" || djSession.AccessLevel === "Staff"
  const isModerator = djSession.AccessLevel === "Moderator"
  const isDeveloper = djSession.Status === "Developer"
  const isDJ = (djSession.Status === "DJ" || djSession.Status === "Active") && djSession.AccessLevel === "DJ"

  const internalUsers = [
    { value: "VOLT_internal-dj", label: "Internal DJ", icon: Radio },
    { value: "VOLT_internal-mod", label: "Internal Moderator", icon: Shield },
    { value: "VOLT_internal-manager", label: "Internal Manager", icon: Users },
    { value: "VOLT_internal-exec", label: "Internal Executive", icon: Crown },
  ]

  const quickActions = []

  if (isDJ || isDeveloper || djSession.AccessLevel === "Management" || djSession.AccessLevel === "Executive") {
    quickActions.push({
      title: "DJ Area",
      description: "Access DJ tools and features",
      icon: Radio,
      color: "blue",
      path: "/myvolt/djs",
    })
  }

  if (isModerator || isDeveloper || djSession.AccessLevel === "Management" || djSession.AccessLevel === "Executive") {
    quickActions.push({
      title: "Moderation",
      description: "Moderate content and users",
      icon: Shield,
      color: "orange",
      path: "/myvolt/moderation",
    })
  }

  if (djSession.AccessLevel === "Management" || djSession.AccessLevel === "Executive") {
    quickActions.push({
      title: "Management",
      description: "Manage staff and operations",
      icon: Users,
      color: "indigo",
      path: "/myvolt/management",
    })
  }

  if (djSession.AccessLevel === "Executive") {
    quickActions.push({
      title: "Executive",
      description: "Executive controls and settings",
      icon: Crown,
      color: "yellow",
      path: "/myvolt/exec",
    })
  }

  if (isDeveloper) {
    quickActions.push(
      {
        title: "DJ Area",
        description: "Access DJ tools and features",
        icon: Radio,
        color: "blue",
        path: "/myvolt/djs",
      },
      {
        title: "Moderation",
        description: "Moderate content and users",
        icon: Shield,
        color: "orange",
        path: "/myvolt/moderation",
      },
      {
        title: "Management",
        description: "Manage staff and operations",
        icon: Users,
        color: "indigo",
        path: "/myvolt/management",
      },
      {
        title: "Executive",
        description: "Executive controls and settings",
        icon: Crown,
        color: "yellow",
        path: "/myvolt/exec",
      },
      {
        title: "Development",
        description: "Developer tools and settings",
        icon: Sparkles,
        color: "purple",
        path: "/myvolt/development",
      },
    )
  }

  const uniqueQuickActions = quickActions.filter(
    (action, index, self) => index === self.findIndex((a) => a.path === action.path),
  )

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons showVolumeToggle={true} />
      </div>
      <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="w-full">
            <MiniPlayer />
          </div>
          {isInternalUser && regularUserData && (
            <div className="bg-orange-600/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-orange-400 font-bold mb-1">Logged in as Internal User</h3>
                  <p className="text-white/60 text-sm">
                    You are currently logged in as <span className="font-semibold">{djSession?.Username}</span>. Your
                    regular account is <span className="font-semibold">{regularUserData.Username}</span>.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSwitchBackToRegular}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 flex items-center gap-2 flex-shrink-0"
              >
                <UserX className="w-4 h-4" />
                Switch Back
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                      <Image
                        src={djSession.ProfilePicture || "/placeholder.svg"}
                        alt={djSession.DJName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{djSession.DJName}</h1>
                    <p className="text-white/50 text-sm">@{djSession.Username}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Access Level</span>
                  <span className="text-white font-medium">{djSession.AccessLevel}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">Status</span>
                  <span className={`${statusInfo.textColor} font-medium`}>{statusInfo.badge}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60 text-sm">DJ ID</span>
                  <span className="text-white font-medium">#{djSession.DJID}</span>
                </div>
              </div>
            </div>
            {isDeveloper && (
              <div className="bg-white/5 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-bold text-white">Developer Access</h2>
                </div>
                <p className="text-white/50 text-sm mb-6">Log in as an internal user for testing purposes.</p>
                {internalLoginError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-xs">{internalLoginError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="internal-user" className="text-white/70 text-sm mb-2 block">
                      Internal User
                    </Label>
                    <Select value={selectedInternalUser} onValueChange={setSelectedInternalUser}>
                      <SelectTrigger
                        id="internal-user"
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 focus:border-orange-500 h-10"
                      >
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20 z-50">
                        {internalUsers.map((user) => {
                          const IconComponent = user.icon
                          return (
                            <SelectItem
                              key={user.value}
                              value={user.value}
                              className="text-white hover:bg-orange-600/30 hover:text-white focus:bg-orange-600/30 focus:text-white data-[highlighted]:bg-orange-600/30 data-[highlighted]:text-white"
                            >
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-orange-400" />
                                <span>{user.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="internal-password" className="text-white/70 text-sm mb-2 block">
                      Password
                    </Label>
                    <div className="flex gap-2">
                      <input
                        id="internal-password"
                        type="password"
                        value={internalPassword}
                        onChange={(e) => setInternalPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && selectedInternalUser && internalPassword) {
                            handleInternalUserLogin()
                          }
                        }}
                        className="flex-1 bg-white/5 border border-white/20 text-white placeholder:text-white/40 hover:bg-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 rounded-lg px-3 py-2 text-sm outline-none h-10"
                        placeholder="Enter password"
                      />
                      <Button
                        onClick={handleInternalUserLogin}
                        disabled={internalLoginLoading || !selectedInternalUser || !internalPassword}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 h-10 disabled:opacity-50"
                      >
                        {internalLoginLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            {isSuspended && (
              <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-bold mb-1">Account Suspended</h3>
                  <p className="text-white/60 text-sm">
                    Your account has been suspended. Please contact management for more information.
                  </p>
                </div>
              </div>
            )}
            {!isSuspended && hasNoAccessLevel && (
              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-yellow-400 font-bold mb-1">No Department Assigned</h3>
                  <p className="text-white/60 text-sm">
                    You haven't been assigned to a department yet. Please contact management for access.
                  </p>
                </div>
              </div>
            )}
            {!isSuspended && !hasNoAccessLevel && uniqueQuickActions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {uniqueQuickActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={action.path}
                      onClick={() => router.push(action.path)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 text-left transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-white/10 rounded-lg p-2 group-hover:scale-110 transition-transform">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white mb-0.5">{action.title}</div>
                          <div className="text-xs text-white/50">{action.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="text-center py-4">
            <p className="text-white/30 text-xs">© VoltRadio 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
