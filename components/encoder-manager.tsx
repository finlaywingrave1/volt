"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Plus, Radio, CheckCircle, XCircle, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Streamer {
  id: number
  station_id: number
  streamer_username: string
  streamer_password: string
  display_name: string
  comments: string | null
  is_active: boolean
  enforce_schedule: boolean
  reactivate_at: number | null
  art_updated_at: number
  schedule_items: string[]
  broadcasts: Broadcast[]
  links: {
    self: string
    broadcasts: string
    broadcasts_batch: string
    art: string
  }
  has_custom_art: boolean
  art: string
}

interface Broadcast {
  timestampStart: string
  timestampEnd: string
  recordingPath: string | null
  id: number
}

export function EncoderManager() {
  const { toast } = useToast()
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [streamerToDelete, setStreamerToDelete] = useState<Streamer | null>(null)

  useEffect(() => {
    fetchStreamers()
  }, [])

  const fetchStreamers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/streamers")
      if (response.ok) {
        const data = await response.json()
        setStreamers(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch streamers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch streamers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch streamers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStreamer = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/streamers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamer_username: formData.streamer_username,
          streamer_password: formData.streamer_password,
          display_name: formData.display_name,
          comments: formData.comments || null,
          is_active: formData.is_active,
          enforce_schedule: formData.enforce_schedule,
          reactivate_at: formData.reactivate_at ? Number.parseInt(formData.reactivate_at) : null,
          schedule_items: [],
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Streamer created successfully",
        })
        setIsCreateModalOpen(false)
        resetForm()
        fetchStreamers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create streamer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create streamer:", error)
      toast({
        title: "Error",
        description: "Failed to create streamer",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateStreamer = async () => {
    if (!selectedStreamer) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/streamers/${selectedStreamer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamer_username: formData.streamer_username,
          streamer_password: formData.streamer_password,
          display_name: formData.display_name,
          comments: formData.comments || null,
          is_active: formData.is_active,
          enforce_schedule: formData.enforce_schedule,
          reactivate_at: formData.reactivate_at ? Number.parseInt(formData.reactivate_at) : null,
          schedule_items: selectedStreamer.schedule_items,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Streamer updated successfully",
        })
        setIsEditModalOpen(false)
        setSelectedStreamer(null)
        resetForm()
        fetchStreamers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update streamer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update streamer:", error)
      toast({
        title: "Error",
        description: "Failed to update streamer",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteStreamer = async () => {
    if (!streamerToDelete) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/streamers/${streamerToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Streamer deleted successfully",
        })
        setDeleteDialogOpen(false)
        setStreamerToDelete(null)
        fetchStreamers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete streamer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete streamer:", error)
      toast({
        title: "Error",
        description: "Failed to delete streamer",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      streamer_username: "",
      streamer_password: "",
      display_name: "",
      comments: "",
      is_active: true,
      enforce_schedule: false,
      reactivate_at: "",
    })
  }

  const openEditModal = (streamer: Streamer) => {
    setSelectedStreamer(streamer)
    setFormData({
      streamer_username: streamer.streamer_username,
      streamer_password: "",
      display_name: streamer.display_name,
      comments: streamer.comments || "",
      is_active: streamer.is_active,
      enforce_schedule: streamer.enforce_schedule,
      reactivate_at: streamer.reactivate_at?.toString() || "",
    })
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (streamer: Streamer) => {
    setStreamerToDelete(streamer)
    setDeleteDialogOpen(true)
  }

  const [formData, setFormData] = useState({
    streamer_username: "",
    streamer_password: "",
    display_name: "",
    comments: "",
    is_active: true,
    enforce_schedule: false,
    reactivate_at: "",
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Streaming Encoders</h2>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-600/50">
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/80">Display Name</TableHead>
              <TableHead className="text-white/80">Username</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80">Broadcasts</TableHead>
              <TableHead className="text-white/80">Comments</TableHead>
              <TableHead className="text-white/80 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-white/60 py-8">
                  Loading streamers...
                </TableCell>
              </TableRow>
            ) : streamers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-white/60 py-8">
                  No streamers found
                </TableCell>
              </TableRow>
            ) : (
              streamers.map((streamer) => (
                <TableRow key={streamer.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 rounded-lg p-2">
                        <Radio className="w-4 h-4 text-blue-400" />
                      </div>
                      <span>{streamer.display_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/80">@{streamer.streamer_username}</TableCell>
                  <TableCell>
                    <Badge className={streamer.is_active ? "bg-green-600" : "bg-red-600"}>
                      {streamer.is_active ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/80">{streamer.broadcasts.length}</TableCell>
                  <TableCell className="text-white/60 text-sm truncate max-w-xs">{streamer.comments || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(streamer)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(streamer)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-400">Delete Streamer</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">{streamerToDelete?.display_name}</span>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStreamer}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
