"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface DJ {
  DJID: number
  UserID: number
  DJName: string
  Username: string
  ProfilePicture: string
  AccessLevel: string
  Status: string
}

interface EditStaffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: DJ | null
  onSave: (djId: number, updates: Record<string, string>) => void
}

const ACCESS_LEVELS = ["DJ", "Moderator", "Management", "Executive"]
const STATUS_OPTIONS = ["Active", "Suspended", "Moderator", "Developer"]

const FIELDS = [
  { value: "DJName", label: "DJ Name" },
  { value: "ProfilePicture", label: "Profile Picture URL" },
  { value: "AccessLevel", label: "Access Level" },
  { value: "Status", label: "Status" },
]

export function EditStaffModal({ open, onOpenChange, staff, onSave }: EditStaffModalProps) {
  const { toast } = useToast()
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (staff) {
      setFieldValues({
        DJName: staff.DJName,
        ProfilePicture: staff.ProfilePicture,
        AccessLevel: staff.AccessLevel,
        Status: staff.Status,
      })
    }
  }, [staff])

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleSubmit = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one field to update",
        variant: "destructive",
      })
      return
    }

    const updates: Record<string, string> = {}
    selectedFields.forEach((field) => {
      if (fieldValues[field]) {
        updates[field] = fieldValues[field]
      }
    })

    if (staff) {
      onSave(staff.DJID, updates)
      onOpenChange(false)
      setSelectedFields([])
    }
  }

  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-purple-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Edit Staff Member
          </DialogTitle>
          <DialogDescription className="text-slate-400">Update details for {staff?.DJName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {FIELDS.map((field) => (
            <div key={field.value} className="space-y-2.5">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  id={field.value}
                  checked={selectedFields.includes(field.value)}
                  onChange={() => handleFieldToggle(field.value)}
                  className="w-5 h-5 rounded border-purple-500/50 bg-white/10 cursor-pointer accent-purple-500"
                />
                <label htmlFor={field.value} className="text-sm font-semibold text-slate-200 cursor-pointer flex-1">
                  {field.label}
                </label>
              </div>

              {selectedFields.includes(field.value) && (
                <div className="pl-8 pr-2 animate-in fade-in duration-200">
                  {field.value === "AccessLevel" ? (
                    <Select
                      value={fieldValues[field.value] || ""}
                      onValueChange={(value) => setFieldValues((prev) => ({ ...prev, [field.value]: value }))}
                    >
                      <SelectTrigger className="bg-slate-700/40 border border-purple-500/30 text-white rounded-lg hover:bg-slate-700/60 focus:border-purple-500/60 transition-all shadow-sm placeholder:text-slate-400">
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-purple-500/30 rounded-lg shadow-2xl">
                        {ACCESS_LEVELS.map((level) => {
                          let indicator = "bg-gray-500"
                          switch (level) {
                            case "Executive":
                              indicator = "bg-purple-500"
                              break
                            case "Management":
                              indicator = "bg-blue-500"
                              break
                            case "Moderator":
                              indicator = "bg-orange-500"
                              break
                            case "DJ":
                              indicator = "bg-green-500"
                              break
                          }
                          return (
                            <SelectItem key={level} value={level} className="cursor-pointer text-white">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${indicator}`} />
                                <span>{level}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : field.value === "Status" ? (
                    <Select
                      value={fieldValues[field.value] || ""}
                      onValueChange={(value) => setFieldValues((prev) => ({ ...prev, [field.value]: value }))}
                    >
                      <SelectTrigger className="bg-slate-700/40 border border-purple-500/30 text-white rounded-lg hover:bg-slate-700/60 focus:border-purple-500/60 transition-all shadow-sm placeholder:text-slate-400">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-purple-500/30 rounded-lg shadow-2xl">
                        {STATUS_OPTIONS.map((status) => {
                          let indicator = "bg-gray-500"
                          switch (status) {
                            case "Active":
                              indicator = "bg-green-500"
                              break
                            case "Suspended":
                              indicator = "bg-red-500"
                              break
                            case "Moderator":
                              indicator = "bg-orange-500"
                              break
                            case "Developer":
                              indicator = "bg-cyan-500"
                              break
                          }
                          return (
                            <SelectItem key={status} value={status} className="cursor-pointer text-white">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${indicator}`} />
                                <span>{status}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <input
                      type="text"
                      value={fieldValues[field.value] || ""}
                      onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.value]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full bg-slate-700/40 border border-purple-500/30 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500/60 focus:outline-none transition-all shadow-sm"
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg py-2.5 transition-all shadow-lg hover:shadow-purple-600/50"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
