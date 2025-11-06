"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DJ {
  DJID: number
  UserID: number
  DJName: string
  Username: string
  ProfilePicture: string
  AccessLevel: string
  Status: string
}

interface User {
  UserID: number
  Username: string
  FullName: string
}

interface StaffManagerProps {
  onEditStaff: (dj: DJ) => void
  onDeleteStaff: (dj: DJ) => void
}

const ACCESS_LEVELS = ["DJ", "Moderator", "Management", "Executive"]

export function StaffManager({ onEditStaff, onDeleteStaff }: StaffManagerProps) {
  const { toast } = useToast()
  const [djs, setDjs] = useState<DJ[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchDJs()
    fetchUsers()
  }, [])

  const fetchDJs = async () => {
    try {
      const response = await fetch("https://api.finlayw.cloud/v1/volt/dj/all", {
        headers: {
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setDjs(Array.isArray(data) ? data : [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch staff",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch DJs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch staff",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/moderation/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
    }
  }

  const handleAddStaff = async () => {
    if (!selectedUserId || !selectedAccessLevel) {
      toast({
        title: "Error",
        description: "Please select both user and access level",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("https://api.finlayw.cloud/v1/volt/dj/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        body: JSON.stringify({
          UserID: Number.parseInt(selectedUserId),
          AccessLevel: selectedAccessLevel,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff member added successfully",
        })
        setAddDialogOpen(false)
        setSelectedUserId("")
        setSelectedAccessLevel("")
        fetchDJs()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to add staff",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to add staff:", error)
      toast({
        title: "Error",
        description: "Failed to add staff",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Executive":
        return "bg-purple-600"
      case "Management":
        return "bg-blue-600"
      case "Moderator":
        return "bg-orange-600"
      case "DJ":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Staff Members</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-600/50">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-purple-500/20 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Add Staff Member
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Grant access to MyVolt for a new staff member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2.5 block">Select User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-slate-700/40 border border-purple-500/30 text-white rounded-lg hover:bg-slate-700/60 focus:border-purple-500/60 transition-all shadow-sm placeholder:text-slate-400">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border border-purple-500/30 rounded-lg shadow-2xl">
                    {users.map((user) => (
                      <SelectItem
                        key={user.UserID}
                        value={user.UserID.toString()}
                        className="text-white cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span>{user.FullName}</span>
                          <span className="text-slate-400">({user.Username})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2.5 block">Select Access Level</label>
                <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                  <SelectTrigger className="bg-slate-700/40 border border-purple-500/30 text-white rounded-lg hover:bg-slate-700/60 focus:border-purple-500/60 transition-all shadow-sm placeholder:text-slate-400">
                    <SelectValue placeholder="Choose access level..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border border-purple-500/30 rounded-lg shadow-2xl">
                    {ACCESS_LEVELS.map((level) => {
                      let bgColor = "bg-gray-600/20"
                      let indicator = "bg-gray-500"
                      switch (level) {
                        case "Executive":
                          bgColor = "bg-purple-600/20"
                          indicator = "bg-purple-500"
                          break
                        case "Management":
                          bgColor = "bg-blue-600/20"
                          indicator = "bg-blue-500"
                          break
                        case "Moderator":
                          bgColor = "bg-orange-600/20"
                          indicator = "bg-orange-500"
                          break
                        case "DJ":
                          bgColor = "bg-green-600/20"
                          indicator = "bg-green-500"
                          break
                      }
                      return (
                        <SelectItem key={level} value={level} className="cursor-pointer text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${indicator}`} />
                            <span className="font-medium">{level}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddStaff}
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg py-2.5 transition-all shadow-lg hover:shadow-purple-600/50 disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "Add Staff Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/80">Staff</TableHead>
              <TableHead className="text-white/80">Username</TableHead>
              <TableHead className="text-white/80">Access Level</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white/60 py-8">
                  Loading staff...
                </TableCell>
              </TableRow>
            ) : djs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white/60 py-8">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              djs.map((dj) => (
                <TableRow key={dj.DJID} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={dj.ProfilePicture || "/placeholder.svg"} alt={dj.DJName} />
                        <AvatarFallback>{dj.DJName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{dj.DJName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/80">@{dj.Username}</TableCell>
                  <TableCell>
                    <Badge className={getAccessLevelColor(dj.AccessLevel)}>{dj.AccessLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-white/80">{dj.Status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditStaff(dj)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteStaff(dj)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
