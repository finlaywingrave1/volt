"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { ManagementSidebar } from "@/components/management-sidebar"
import { UserManager } from "@/components/user-manager"
import { EditUserModal } from "@/components/edit-user-modal"
import { DeleteUserModal } from "@/components/delete-user-modal"
import { StaffManager } from "@/components/staff-manager"
import { EditStaffModal } from "@/components/edit-staff-modal"
import { DeleteStaffModal } from "@/components/delete-staff-modal"
import { ApplicationsManager } from "@/components/applications-manager"
import { EncoderManager } from "@/components/encoder-manager"
import { DJBibleManager } from "@/components/djbible-manager"
import { useToast } from "@/hooks/use-toast"
import { Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface DJ {
  DJID: number
  UserID: number
  DJName: string
  Username: string
  ProfilePicture: string
  AccessLevel: string
  Status: string
}

export default function ManagementAreaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<"users" | "staff" | "encoders" | "applications" | "djbible">(
    "users",
  )
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<DJ | null>(null)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false)
  const [editStaffModalOpen, setEditStaffModalOpen] = useState(false)
  const [deleteStaffModalOpen, setDeleteStaffModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const accessLevel = localStorage.getItem("dj_AccessLevel")
    const status = localStorage.getItem("dj_Status")

    if (!accessLevel) {
      router.push("/myvolt/login")
      return
    }

    if (accessLevel !== "Management" && accessLevel !== "Executive" && status !== "Developer") {
      router.push("/myvolt")
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUserModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteUserModalOpen(true)
  }

  const handleSaveUserChanges = async (userId: number, updates: Record<string, string>) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`https://api.finlayw.cloud/v1/volt/users/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteUserConfirm = async (userId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`https://api.finlayw.cloud/v1/volt/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        setDeleteUserModalOpen(false)
        setSelectedUser(null)
        window.location.reload()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditStaff = (dj: DJ) => {
    setSelectedStaff(dj)
    setEditStaffModalOpen(true)
  }

  const handleDeleteStaff = (dj: DJ) => {
    setSelectedStaff(dj)
    setDeleteStaffModalOpen(true)
  }

  const handleSaveStaffChanges = async (djId: number, updates: Record<string, string>) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`https://api.finlayw.cloud/v1/volt/dj/update/${djId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        })
        setEditStaffModalOpen(false)
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to update staff member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update staff:", error)
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteStaffConfirm = async (djId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`https://api.finlayw.cloud/v1/volt/djs/delete/${djId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        })
        setDeleteStaffModalOpen(false)
        setSelectedStaff(null)
        window.location.reload()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to delete staff member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete staff:", error)
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
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

      <div className="relative z-10 min-h-screen pt-20 flex items-center justify-center p-6">
        <div className="w-full max-w-7xl">
          <div className="mb-6">
            <MiniPlayer />
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-4 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Management Portal</h1>
                <p className="text-slate-400 mt-1">Manage users, staff, and streaming infrastructure</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <ManagementSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {activeSection === "users" && (
                  <UserManager onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
                )}

                {activeSection === "staff" && (
                  <StaffManager onEditStaff={handleEditStaff} onDeleteStaff={handleDeleteStaff} />
                )}

                {activeSection === "encoders" && <EncoderManager />}

                {activeSection === "applications" && <ApplicationsManager />}

                {activeSection === "djbible" && <DJBibleManager />}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-slate-500 text-xs font-bold">© VoltRadio 2025</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        open={editUserModalOpen}
        onOpenChange={setEditUserModalOpen}
        user={selectedUser}
        onSave={handleSaveUserChanges}
      />

      <DeleteUserModal
        open={deleteUserModalOpen}
        onOpenChange={setDeleteUserModalOpen}
        user={selectedUser}
        onConfirm={handleDeleteUserConfirm}
        isDeleting={isProcessing}
      />

      <EditStaffModal
        open={editStaffModalOpen}
        onOpenChange={setEditStaffModalOpen}
        staff={selectedStaff}
        onSave={handleSaveStaffChanges}
      />

      <DeleteStaffModal
        open={deleteStaffModalOpen}
        onOpenChange={setDeleteStaffModalOpen}
        staff={selectedStaff}
        onConfirm={handleDeleteStaffConfirm}
        isDeleting={isProcessing}
      />
    </div>
  )
}
