"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, X } from "lucide-react"

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

interface EditField {
  id: string
  field: "FullName" | "Description" | "profileUrl" | "UserRole" | "LinkedDiscordUsername" | "LinkedDiscordUserID" | ""
  value: string
}

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (userId: number, updates: Record<string, string>) => Promise<void>
}

const FIELD_OPTIONS = [
  { value: "FullName", label: "Full Name", description: "Change display/full name" },
  { value: "Description", label: "Bio", description: "Change user bio" },
  { value: "profileUrl", label: "Profile Picture", description: "Change profile picture" },
  { value: "UserRole", label: "Role", description: 'Update the role string (e.g., "User" → "Lead Developer")' },
  { value: "LinkedDiscordUsername", label: "Discord Username", description: "Set Discord username" },
  { value: "LinkedDiscordUserID", label: "Discord User ID", description: "Set Discord ID" },
]

export function EditUserModal({ open, onOpenChange, user, onSave }: EditUserModalProps) {
  const { toast } = useToast()
  const [fields, setFields] = useState<EditField[]>([{ id: "1", field: "", value: "" }])
  const [isSaving, setIsSaving] = useState(false)

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), field: "", value: "" }])
  }

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter((f) => f.id !== id))
    }
  }

  const updateField = (id: string, field: keyof typeof FIELD_OPTIONS | "", value: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, field: field as any, value } : f)))
  }

  const handleSave = async () => {
    if (!user) return

    // Validate that all fields have selections
    const validFields = fields.filter((f) => f.field && f.value)

    if (validFields.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in at least one field",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const updates: Record<string, string> = {}
      validFields.forEach((field) => {
        if (field.field) {
          updates[field.field] = field.value
        }
      })

      await onSave(user.UserID, updates)
      setFields([{ id: "1", field: "", value: "" }])
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User: {user?.FullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field, index) => (
            <Card key={field.id} className="bg-white/5 border-white/10 p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <label className="text-white/80 text-sm font-medium">Field {index + 1}</label>
                  {fields.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeField(field.id)}
                      className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <Select value={field.field} onValueChange={(value: any) => updateField(field.id, value, field.value)}>
                  <SelectTrigger className="bg-black/40 border-white/20 text-white">
                    <SelectValue placeholder="Select field to edit" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10">
                    {FIELD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-white/50">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {field.field === "Description" ? (
                  <Textarea
                    placeholder="Enter new bio"
                    value={field.value}
                    onChange={(e) => updateField(field.id, field.field, e.target.value)}
                    className="bg-black/40 border-white/20 text-white min-h-[80px]"
                  />
                ) : (
                  <Input
                    placeholder={`Enter new ${FIELD_OPTIONS.find((o) => o.value === field.field)?.label?.toLowerCase()}`}
                    value={field.value}
                    onChange={(e) => updateField(field.id, field.field, e.target.value)}
                    className="bg-black/40 border-white/20 text-white"
                  />
                )}
              </div>
            </Card>
          ))}

          <Button
            onClick={addField}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Field
          </Button>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
