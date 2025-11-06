"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit, Loader, Check } from "lucide-react"

interface Application {
  ApplicationID: number
  UserID: number
  DiscordUsername: string
  Answer1: string
  Answer2: string
  Answer3: string
  Status: string
  SubmittedAt: string
  Comments: Array<{
    CommentID: number
    CommentedBy: string
    CommentText: string
    Timestamp: string
  }>
}

const statusOptions = [
  { value: "Reviewing", label: "Reviewing", color: "bg-blue-500/20 text-blue-300" },
  { value: "On Hold", label: "On Hold", color: "bg-yellow-500/20 text-yellow-300" },
  { value: "Accepted", label: "Accepted", color: "bg-green-500/20 text-green-300" },
  { value: "Denied", label: "Denied", color: "bg-red-500/20 text-red-300" },
]

export function ApplicationsManager() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState("")
  const [updateComment, setUpdateComment] = useState("")
  const [updateCommentedBy, setUpdateCommentedBy] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    if (isDetailsOpen && selectedApp) {
      const storedDJName = localStorage.getItem("dj_DJName")
      if (storedDJName) {
        setUpdateCommentedBy(storedDJName)
      }
      setUpdateStatus(selectedApp.Status)
      setUpdateComment("")
    }
  }, [isDetailsOpen, selectedApp])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://api.finlayw.cloud/v1/volt/applications/all", {
        headers: {
          Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(Array.isArray(data) ? data : [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch applications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectApp = (app: Application) => {
    setSelectedApp(app)
    setIsDetailsOpen(true)
  }

  const handleUpdateApplication = async () => {
    if (!selectedApp || !updateStatus || updateStatus === "Submitted") {
      toast({
        title: "Error",
        description: "Cannot update to Submitted status. Please select another status.",
        variant: "destructive",
      })
      return
    }

    if (!updateComment.trim() || !updateCommentedBy.trim()) {
      toast({
        title: "Error",
        description: "Comment and commenter name are required",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const payload = {
        Status: updateStatus,
        CommentedBy: updateCommentedBy,
        CommentText: updateComment,
      }

      const response = await fetch(
        `https://api.finlayw.cloud/v1/volt/applications/update/${selectedApp.ApplicationID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
          },
          body: JSON.stringify(payload),
        },
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application updated successfully",
        })
        setIsDetailsOpen(false)
        setSelectedApp(null)
        fetchApplications()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to update application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update application:", error)
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteApplication = async () => {
    if (!selectedApp) return

    if (!confirm("Are you sure you want to delete this application?")) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(
        `https://api.finlayw.cloud/v1/volt/applications/delete/${selectedApp.ApplicationID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
          },
        },
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application deleted successfully",
        })
        setIsDetailsOpen(false)
        setSelectedApp(null)
        fetchApplications()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to delete application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete application:", error)
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  const currentStatus = statusOptions.find((s) => s.value === updateStatus)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Applications ({applications.length})</h2>
        <Button
          onClick={fetchApplications}
          variant="outline"
          size="sm"
          className="border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
        >
          Refresh
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 text-left text-white/60 font-semibold text-sm">Application ID</th>
                <th className="px-6 py-3 text-left text-white/60 font-semibold text-sm">Discord Username</th>
                <th className="px-6 py-3 text-left text-white/60 font-semibold text-sm">Status</th>
                <th className="px-6 py-3 text-left text-white/60 font-semibold text-sm">Submitted</th>
                <th className="px-6 py-3 text-left text-white/60 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.ApplicationID}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleSelectApp(app)}
                  >
                    <td className="px-6 py-4 text-white font-medium">#{app.ApplicationID}</td>
                    <td className="px-6 py-4 text-white/80">{app.DiscordUsername}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.Status === "Accepted"
                            ? "bg-green-500/20 text-green-300"
                            : app.Status === "Denied"
                              ? "bg-red-500/20 text-red-300"
                              : app.Status === "On Hold"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {app.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">{new Date(app.SubmittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:bg-blue-500/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectApp(app)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-black/80 border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application #{selectedApp?.ApplicationID}</DialogTitle>
            <DialogDescription className="text-white/60">{selectedApp?.DiscordUsername}</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm font-medium mb-2">Answers</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">Why do you wish to join the volt team?</p>
                    <p className="text-white/60 text-sm">{selectedApp.Answer1}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">Relevant experience</p>
                    <p className="text-white/60 text-sm">{selectedApp.Answer2}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">Demo link</p>
                    <p className="text-white/60 text-sm break-all">{selectedApp.Answer3}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Update Status</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 flex items-center justify-between border ${
                        isStatusOpen
                          ? "bg-purple-500/20 border-purple-500/40"
                          : "bg-black/30 border-white/20 hover:border-white/30"
                      } text-white`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${currentStatus?.color}`}>
                          {currentStatus?.label}
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </button>

                    {isStatusOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 border border-white/20 rounded-xl shadow-xl overflow-hidden z-50">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setUpdateStatus(option.value)
                              setIsStatusOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200 flex items-center justify-between border-b border-white/5 last:border-b-0 group"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${option.color}`}>
                                {option.label}
                              </div>
                              <span className="text-white/70 group-hover:text-white text-sm transition-colors">
                                {option.label}
                              </span>
                            </div>
                            {updateStatus === option.value && (
                              <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-2">Commenter Name</label>
                  <Input
                    type="text"
                    value={updateCommentedBy}
                    onChange={(e) => setUpdateCommentedBy(e.target.value)}
                    placeholder="Your name/username"
                    className="bg-black/30 border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-2">Comment</label>
                  <textarea
                    value={updateComment}
                    onChange={(e) => setUpdateComment(e.target.value)}
                    placeholder="Add a comment about this application..."
                    className="w-full bg-black/30 border border-white/20 text-white rounded-xl p-3 min-h-24 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateApplication}
                  disabled={isUpdating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {isUpdating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Application
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDeleteApplication}
                  disabled={isUpdating}
                  variant="destructive"
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
