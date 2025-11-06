"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface DeleteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onConfirm: (userId: number) => Promise<void>
  isDeleting?: boolean
}

export function DeleteUserModal({ open, onOpenChange, user, onConfirm, isDeleting = false }: DeleteUserModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black/95 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Are you sure you want to delete <span className="text-white font-semibold">{user?.FullName}</span>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 bg-red-950/20 rounded border border-red-500/20 px-3 text-sm text-red-200">
          This will permanently delete the user account and all associated data.
        </div>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && onConfirm(user.UserID)}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
