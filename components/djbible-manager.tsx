"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { BookOpen, Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DJBiblePage {
  id: string
  title: string
  author: string
  content: string
  created_at: string
}

export function DJBibleManager() {
  const { toast } = useToast()
  const [pages, setPages] = useState<DJBiblePage[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<DJBiblePage | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ title: "", author: "", content: "" })
  const [processing, setProcessing] = useState(false)

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/djbible")
      if (!response.ok) throw new Error("Failed to fetch pages")
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error("[v0] Failed to fetch DJ Bible pages:", error)
      toast({
        title: "Error",
        description: "Failed to load DJ Bible pages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleCreate = () => {
    setIsCreating(true)
    setSelectedPage(null)
    setFormData({ title: "", author: "", content: "" })
    setEditDialogOpen(true)
  }

  const handleEdit = (page: DJBiblePage) => {
    setIsCreating(false)
    setSelectedPage(page)
    setFormData({ title: page.title, author: page.author, content: page.content })
    setEditDialogOpen(true)
  }

  const handleDelete = (page: DJBiblePage) => {
    setSelectedPage(page)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.author || !formData.content) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const url = isCreating ? "/api/djbible" : `/api/djbible/${selectedPage?.id}`
      const method = isCreating ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save page")

      toast({
        title: "Success",
        description: `Page ${isCreating ? "created" : "updated"} successfully`,
      })

      setEditDialogOpen(false)
      fetchPages()
    } catch (error) {
      console.error("[v0] Failed to save page:", error)
      toast({
        title: "Error",
        description: `Failed to ${isCreating ? "create" : "update"} page`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPage) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/djbible/${selectedPage.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete page")

      toast({
        title: "Success",
        description: "Page deleted successfully",
      })

      setDeleteDialogOpen(false)
      fetchPages()
    } catch (error) {
      console.error("[v0] Failed to delete page:", error)
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 rounded-xl p-2 border border-blue-500/20">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">DJ Bible Manager</h2>
            <p className="text-slate-400 text-sm">Manage DJ Bible pages and content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchPages}
            variant="outline"
            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">{page.title}</h3>
                <p className="text-slate-400 text-sm mb-2">By {page.author}</p>
                <p className="text-slate-500 text-xs">Created: {new Date(page.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(page)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(page)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No DJ Bible pages yet</p>
            <p className="text-sm mt-1">Create your first page to get started</p>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create New Page" : "Edit Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Page title"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Author</label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Content (HTML supported)</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<h2>Heading</h2><p>Content...</p>"
                rows={10}
                className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setEditDialogOpen(false)}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {processing ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{selectedPage?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
