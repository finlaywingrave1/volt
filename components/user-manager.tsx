"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Trash2 } from "lucide-react"

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

interface UserManagerProps {
  onEditUser: (user: User) => void
  onDeleteUser: (user: User) => void
}

export function UserManager({ onEditUser, onDeleteUser }: UserManagerProps) {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

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

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/80">User</TableHead>
              <TableHead className="text-white/80">Username</TableHead>
              <TableHead className="text-white/80">Role</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white/60 py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white/60 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.UserID} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profileUrl || "/placeholder.svg"} alt={user.FullName} />
                        <AvatarFallback>{user.FullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.FullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/80">{user.Username}</TableCell>
                  <TableCell className="text-white/80">{user.UserRole}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.isExecutive && <Badge className="bg-purple-600">Executive</Badge>}
                      {user.isManager && <Badge className="bg-blue-600">Manager</Badge>}
                      {user.isStaff && <Badge className="bg-green-600">Staff</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditUser(user)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteUser(user)}
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
