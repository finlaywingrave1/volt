"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { Shield, AlertTriangle, Clock, Ban, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
  UserID: number
  Username: string
  FullName: string
  UserRole: string
  profileUrl: string
  isStaff: boolean
  isManager: boolean
  isExecutive: boolean
}

interface Warning {
  WarningID: number
  Timestamp: string
  WarnedBy: string
  Reason: string
  IsAccepted: boolean
}

interface TempBan {
  TempBanID: number
  Timestamp: string
  BannedBy: string
  Reason: string
  BannedUntil: string
}

interface PermBan {
  BanID: number
  Timestamp: string
  IPAddress?: string
  BannedBy: string
  Reason: string
}

interface ModerationHistory {
  warnings: Warning[]
  tempbans: TempBan[]
  bans: PermBan[]
}

export default function ModerationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [moderationHistory, setModerationHistory] = useState<ModerationHistory | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Modal states
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [tempbanModalOpen, setTempbanModalOpen] = useState(false)
  const [banModalOpen, setBanModalOpen] = useState(false)

  // Form states
  const [warnReason, setWarnReason] = useState("")
  const [tempbanReason, setTempbanReason] = useState("")
  const [tempbanUntil, setTempbanUntil] = useState("")
  const [banReason, setBanReason] = useState("")

  useEffect(() => {
    const djStatus = localStorage.getItem("dj_Status")
    const accessLevel = localStorage.getItem("dj_AccessLevel")

    if (
      djStatus === "Moderator" ||
      accessLevel === "Moderator" ||
      accessLevel === "Management" ||
      accessLevel === "Executive" ||
      djStatus === "Developer"
    ) {
      setIsAuthorized(true)
      fetchUsers()
    } else {
      router.push("/myvolt")
    }
  }, [router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/moderation/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchModerationHistory = async (userId: number) => {
    try {
      const response = await fetch(`/api/moderation/history/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setModerationHistory(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch moderation history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch moderation history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch moderation history",
        variant: "destructive",
      })
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    fetchModerationHistory(user.UserID)
    setSheetOpen(true)
  }

  const issueWarning = async () => {
    if (!selectedUser || !warnReason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const warnedBy = localStorage.getItem("dj_Username") || "Unknown"
      const response = await fetch("/api/moderation/warnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warned_user_id: selectedUser.UserID,
          warned_by: warnedBy,
          reason: warnReason,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Warning issued successfully",
        })
        setWarnReason("")
        setWarningModalOpen(false)
        fetchModerationHistory(selectedUser.UserID)
      } else {
        toast({
          title: "Error",
          description: "Failed to issue warning",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to issue warning:", error)
      toast({
        title: "Error",
        description: "Failed to issue warning",
        variant: "destructive",
      })
    }
  }

  const issueTempBan = async () => {
    if (!selectedUser || !tempbanReason || !tempbanUntil) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const bannedBy = localStorage.getItem("dj_Username") || "Unknown"
      const response = await fetch("/api/moderation/tempbans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned_user_id: selectedUser.UserID,
          banned_by: bannedBy,
          reason: tempbanReason,
          banned_until: new Date(tempbanUntil).toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Temporary ban issued successfully",
        })
        setTempbanReason("")
        setTempbanUntil("")
        setTempbanModalOpen(false)
        fetchModerationHistory(selectedUser.UserID)
      } else {
        toast({
          title: "Error",
          description: "Failed to issue temporary ban",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to issue tempban:", error)
      toast({
        title: "Error",
        description: "Failed to issue temporary ban",
        variant: "destructive",
      })
    }
  }

  const issuePermBan = async () => {
    if (!banReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const bannedBy = localStorage.getItem("dj_Username") || "Unknown"
      const body: any = {
        banned_by: bannedBy,
        reason: banReason,
      }

      if (selectedUser) body.banned_user_id = selectedUser.UserID

      const response = await fetch("/api/moderation/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Permanent ban issued successfully",
        })
        setBanReason("")
        setBanModalOpen(false)
        if (selectedUser) {
          fetchModerationHistory(selectedUser.UserID)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to issue permanent ban",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to issue ban:", error)
      toast({
        title: "Error",
        description: "Failed to issue permanent ban",
        variant: "destructive",
      })
    }
  }

  const deleteWarning = async (id: number) => {
    try {
      const response = await fetch(`/api/moderation/warnings/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Warning deleted successfully",
        })
        if (selectedUser) {
          fetchModerationHistory(selectedUser.UserID)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete warning",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete warning:", error)
      toast({
        title: "Error",
        description: "Failed to delete warning",
        variant: "destructive",
      })
    }
  }

  const deleteTempBan = async (id: number) => {
    try {
      const response = await fetch(`/api/moderation/tempbans/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Temporary ban deleted successfully",
        })
        if (selectedUser) {
          fetchModerationHistory(selectedUser.UserID)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete temporary ban",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete tempban:", error)
      toast({
        title: "Error",
        description: "Failed to delete temporary ban",
        variant: "destructive",
      })
    }
  }

  const deletePermBan = async (id: number) => {
    try {
      const response = await fetch(`/api/moderation/bans/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Permanent ban deleted successfully",
        })
        if (selectedUser) {
          fetchModerationHistory(selectedUser.UserID)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete permanent ban",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete ban:", error)
      toast({
        title: "Error",
        description: "Failed to delete permanent ban",
        variant: "destructive",
      })
    }
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-['Poppins']">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons showVolumeToggle={true} />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => router.push("/myvolt")}
          variant="ghost"
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 text-white hover:bg-slate-800/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to MyVolt
        </Button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl">
          <div className="mb-6">
            <MiniPlayer />
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 border border-blue-500/30 shadow-lg shadow-blue-500/20">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Moderation Panel</h1>
                  <p className="text-slate-400 mt-1">Manage users and moderation actions</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-600/50 rounded-2xl overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                    <TableHead className="text-slate-200 font-semibold">User</TableHead>
                    <TableHead className="text-slate-200 font-semibold">Username</TableHead>
                    <TableHead className="text-slate-200 font-semibold">Role</TableHead>
                    <TableHead className="text-slate-200 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-12">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-12">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.UserID}
                        className="border-slate-600/50 hover:bg-slate-700/50 cursor-pointer transition-all duration-200"
                        onClick={() => handleUserClick(user)}
                      >
                        <TableCell className="text-white">
                          <div className="flex items-center gap-3">
                            <Avatar className="ring-2 ring-slate-700/50">
                              <AvatarImage src={user.profileUrl || "/placeholder.svg"} alt={user.FullName} />
                              <AvatarFallback className="bg-slate-700 text-white">
                                {user.FullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.FullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">@{user.Username}</TableCell>
                        <TableCell className="text-slate-300">{user.UserRole}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {user.isExecutive && (
                              <Badge className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30">
                                Executive
                              </Badge>
                            )}
                            {user.isManager && (
                              <Badge className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30">
                                Manager
                              </Badge>
                            )}
                            {user.isStaff && (
                              <Badge className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
                                Staff
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-slate-500 text-xs font-bold">© VoltRadio 2025</p>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-gradient-to-br from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-3">
              {selectedUser && (
                <>
                  <Avatar className="flex-shrink-0 ring-2 ring-slate-700/50">
                    <AvatarImage src={selectedUser.profileUrl || "/placeholder.svg"} alt={selectedUser.FullName} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {selectedUser.FullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xl font-bold">{selectedUser.FullName}</div>
                    <div className="text-sm text-slate-400 truncate">@{selectedUser.Username}</div>
                  </div>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            <div className="flex gap-3 flex-wrap">
              <Dialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg shadow-yellow-600/30 transition-all">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Issue Warning
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Issue Warning</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block font-medium">Reason</label>
                      <Textarea
                        placeholder="Enter warning reason"
                        value={warnReason}
                        onChange={(e) => setWarnReason(e.target.value)}
                        className="bg-slate-800/50 border-slate-600/50 text-white min-h-[100px] focus:border-yellow-500/50 transition-colors"
                      />
                    </div>
                    <Button
                      onClick={issueWarning}
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg"
                    >
                      Issue Warning
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={tempbanModalOpen} onOpenChange={setTempbanModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-600/30 transition-all">
                    <Clock className="w-4 h-4 mr-2" />
                    Issue Temp Ban
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Issue Temporary Ban</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block font-medium">Ban Until</label>
                      <Input
                        type="datetime-local"
                        value={tempbanUntil}
                        onChange={(e) => setTempbanUntil(e.target.value)}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block font-medium">Reason</label>
                      <Textarea
                        placeholder="Enter ban reason"
                        value={tempbanReason}
                        onChange={(e) => setTempbanReason(e.target.value)}
                        className="bg-slate-800/50 border-slate-600/50 text-white min-h-[100px] focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                    <Button
                      onClick={issueTempBan}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg"
                    >
                      Issue Temporary Ban
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30 transition-all">
                    <Ban className="w-4 h-4 mr-2" />
                    Issue Perm Ban
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-slate-900/95 to-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Issue Permanent Ban</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block font-medium">Reason</label>
                      <Textarea
                        placeholder="Enter ban reason"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className="bg-slate-800/50 border-slate-600/50 text-white min-h-[100px] focus:border-red-500/50 transition-colors"
                      />
                    </div>
                    <Button
                      onClick={issuePermBan}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                    >
                      Issue Permanent Ban
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {moderationHistory && (
              <div className="space-y-6">
                {/* Warnings */}
                {moderationHistory.warnings && moderationHistory.warnings.length > 0 && (
                  <div>
                    <h3 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Warnings ({moderationHistory.warnings.length})
                    </h3>
                    <div className="space-y-3">
                      {moderationHistory.warnings.map((warning) => (
                        <Card
                          key={warning.WarningID}
                          className="bg-gradient-to-br from-yellow-950/40 to-yellow-950/20 border-yellow-500/40 p-5 shadow-lg hover:shadow-yellow-500/20 transition-all"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium break-words leading-relaxed">{warning.Reason}</p>
                              <p className="text-slate-400 text-sm truncate mt-2">Issued by: {warning.WarnedBy}</p>
                              <p className="text-slate-500 text-xs mt-1">
                                {new Date(warning.Timestamp).toLocaleString()}
                              </p>
                              {warning.IsAccepted && (
                                <Badge className="mt-3 bg-green-600 shadow-lg shadow-green-600/30">Accepted</Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteWarning(warning.WarningID)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 flex-shrink-0 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Temp Bans */}
                {moderationHistory.tempbans && moderationHistory.tempbans.length > 0 && (
                  <div>
                    <h3 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Temporary Bans ({moderationHistory.tempbans.length})
                    </h3>
                    <div className="space-y-3">
                      {moderationHistory.tempbans.map((tempban) => (
                        <Card
                          key={tempban.TempBanID}
                          className="bg-gradient-to-br from-orange-950/40 to-orange-950/20 border-orange-500/40 p-5 shadow-lg hover:shadow-orange-500/20 transition-all"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium break-words leading-relaxed">{tempban.Reason}</p>
                              <p className="text-slate-400 text-sm truncate mt-2">Issued by: {tempban.BannedBy}</p>
                              <p className="text-slate-400 text-sm mt-1">
                                Until: {new Date(tempban.BannedUntil).toLocaleString()}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                {new Date(tempban.Timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTempBan(tempban.TempBanID)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 flex-shrink-0 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permanent Bans */}
                {moderationHistory.bans && moderationHistory.bans.length > 0 && (
                  <div>
                    <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <Ban className="w-5 h-5" />
                      Permanent Bans ({moderationHistory.bans.length})
                    </h3>
                    <div className="space-y-3">
                      {moderationHistory.bans.map((ban) => (
                        <Card
                          key={ban.BanID}
                          className="bg-gradient-to-br from-red-950/40 to-red-950/20 border-red-500/40 p-5 shadow-lg hover:shadow-red-500/20 transition-all"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium break-words leading-relaxed">{ban.Reason}</p>
                              <p className="text-slate-400 text-sm truncate mt-2">Issued by: {ban.BannedBy}</p>
                              {ban.IPAddress && (
                                <p className="text-slate-400 text-sm truncate mt-1">IP: {ban.IPAddress}</p>
                              )}
                              <p className="text-slate-500 text-xs mt-1">{new Date(ban.Timestamp).toLocaleString()}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deletePermBan(ban.BanID)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 flex-shrink-0 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {(!moderationHistory.warnings || moderationHistory.warnings.length === 0) &&
                  (!moderationHistory.tempbans || moderationHistory.tempbans.length === 0) &&
                  (!moderationHistory.bans || moderationHistory.bans.length === 0) && (
                    <p className="text-slate-400 text-center py-12">No moderation history found for this user.</p>
                  )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
