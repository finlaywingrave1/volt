"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DJ {
  DJID: number
  DJName: string
}

interface DeleteStaffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: DJ | null
  onConfirm: (djId: number) => void
  isDeleting: boolean
}

export function DeleteStaffModal({ open, onOpenChange, staff, onConfirm, isDeleting }: DeleteStaffModalProps) {
  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Delete Staff Member
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Are you sure you want to delete {staff.DJName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(staff.DJID)
              onOpenChange(false)
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
