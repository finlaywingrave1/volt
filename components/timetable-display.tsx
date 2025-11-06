"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeSlot {
  Timestamp: string
  BookedBy?: string
  ShowName?: string
  PermShow?: boolean
}

interface DJ {
  DJID: number
  UserID: number
  DJName: string
  Username: string
  ProfilePicture: string
  AccessLevel: number
  Status: string
}

interface TimetableData {
  start: string
  end: string
  slots: TimeSlot[]
}

export function TimetableDisplay() {
  const [timetable, setTimetable] = useState<TimetableData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [showName, setShowName] = useState("")
  const [bookedBy, setBookedBy] = useState("")
  const [bookedByUsername, setBookedByUsername] = useState("")
  const [permShow, setPermShow] = useState(false)
  const [accessLevel, setAccessLevel] = useState("")
  const [userID, setUserID] = useState("")
  const [djs, setDjs] = useState<DJ[]>([])
  const [selectedDJ, setSelectedDJ] = useState("")
  const [djNames, setDjNames] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get user info from localStorage
    const level = localStorage.getItem("dj_AccessLevel")?.trim() || ""
    const id = localStorage.getItem("dj_UserID")?.trim() || ""
    setAccessLevel(level)
    setUserID(id)
    setBookedBy(id)

    // Initialize data loading
    initializeData(level, id)
  }, [])

  const initializeData = async (level: string, id: string) => {
    try {
      // Fetch DJs first if Management/Executive
      let djList: DJ[] = []
      if (level === "Management" || level === "Executive") {
        djList = await fetchDJs()
      }

      // Then fetch timetable with DJ list available
      await fetchTimetable(djList)
    } catch (error) {
      console.error("[v0] Error initializing data:", error)
      setIsLoading(false)
    }
  }

  const fetchDJs = async (): Promise<DJ[]> => {
    try {
      console.log("[v0] Fetching DJs...")
      const response = await fetch("https://api.finlayw.cloud/v1/volt/dj/all", {
        headers: {
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] DJs fetched:", data)
      setDjs(data)
      return data
    } catch (error) {
      console.error("[v0] Failed to fetch DJs:", error)
      return []
    }
  }

  const fetchTimetable = async (djList: DJ[] = djs) => {
    try {
      console.log("[v0] Fetching timetable with DJs:", djList)
      const today = new Date()
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      const startDate = new Date(today.setDate(diff))
      const startDateStr = startDate.toISOString().split("T")[0]

      const response = await fetch(`https://api.finlayw.cloud/v1/volt/timetable/week?start=${startDateStr}`, {
        headers: {
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
      })

      if (!response.ok) throw new Error(`API returned ${response.status}`)

      const data = await response.json()
      console.log("[v0] Timetable fetched:", data)
      setTimetable(data)

      const names: Record<string, string> = {}
      djList.forEach((dj) => {
        names[dj.Username] = dj.DJName
      })
      console.log("[v0] DJ names available:", names)
      setDjNames(names)
    } catch (error) {
      console.error("[v0] Failed to fetch timetable:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlotClick = (day: Date, hour: number) => {
    const slotTime = new Date(day)
    slotTime.setHours(hour, 0, 0, 0)
    const slot = timetable?.slots.find((s) => new Date(s.Timestamp).getTime() === slotTime.getTime())

    if (slot?.BookedBy) {
      // Check if user can edit this slot
      if (accessLevel === "Management" || accessLevel === "Executive" || slot.BookedBy === userID) {
        setSelectedSlot(slot)
        setShowName(slot.ShowName || "")
        setBookedBy(slot.BookedBy || "")
        setPermShow(slot.PermShow || false)
        setIsUpdateModalOpen(true)
      }
    } else {
      const unbokedSlot: TimeSlot = {
        Timestamp: slotTime.toISOString(),
      }
      setSelectedSlot(unbokedSlot)
      setShowName("")
      setBookedBy(userID)
      setSelectedDJ(userID)
      setPermShow(false)
      setIsBookingModalOpen(true)
    }
  }

  const handleBookShow = async () => {
    if (!selectedSlot || !showName) return

    const finalBookedBy = accessLevel === "Management" || accessLevel === "Executive" ? selectedDJ : userID

    try {
      const response = await fetch("https://api.finlayw.cloud/v1/volt/timetable/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        body: JSON.stringify({
          Timestamp: selectedSlot.Timestamp,
          BookedBy: finalBookedBy,
          ShowName: showName,
          PermShow: permShow && (accessLevel === "Management" || accessLevel === "Executive"),
        }),
      })

      if (!response.ok) throw new Error("Failed to book show")

      setIsBookingModalOpen(false)
      fetchTimetable()
    } catch (error) {
      console.error("Failed to book show:", error)
    }
  }

  const handleUpdateShow = async () => {
    if (!selectedSlot) return

    try {
      const response = await fetch(
        `https://api.finlayw.cloud/v1/volt/timetable/update?timestamp=${encodeURIComponent(selectedSlot.Timestamp)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
          },
          body: JSON.stringify({
            BookedBy: userID,
            ShowName: showName,
            PermShow: permShow && (accessLevel === "Management" || accessLevel === "Executive"),
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to update show")

      setIsUpdateModalOpen(false)
      fetchTimetable()
    } catch (error) {
      console.error("Failed to update show:", error)
    }
  }

  const handleUnbook = async () => {
    if (!selectedSlot) return

    try {
      const response = await fetch(
        `https://api.finlayw.cloud/v1/volt/timetable/unbook?timestamp=${encodeURIComponent(selectedSlot.Timestamp)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
          },
        },
      )

      if (!response.ok) throw new Error("Failed to unbook show")

      setIsUpdateModalOpen(false)
      fetchTimetable()
    } catch (error) {
      console.error("Failed to unbook show:", error)
    }
  }

  if (isLoading) {
    return <div className="text-white/40 text-center py-8">Loading timetable...</div>
  }

  if (!timetable) {
    return <div className="text-white/40 text-center py-8">Failed to load timetable</div>
  }

  // Generate 7 days starting from the start date
  const startDate = new Date(timetable.start)
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    days.push(date)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Timetable</h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-white/60 font-semibold text-sm">Time</th>
              {days.map((day) => (
                <th key={day.toISOString()} className="text-center px-2 py-3 text-white font-semibold text-sm">
                  <div>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className="text-white/60 text-xs">
                    {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 24 }).map((_, hour) => (
              <tr key={hour} className="border-b border-white/10">
                <td className="px-4 py-3 text-white/60 font-semibold text-sm">{String(hour).padStart(2, "0")}:00</td>
                {days.map((day) => {
                  const slotTime = new Date(day)
                  slotTime.setHours(hour, 0, 0, 0)
                  const slot = timetable.slots.find((s) => new Date(s.Timestamp).getTime() === slotTime.getTime())

                  const djName = slot?.BookedBy
                    ? (() => {
                        const dj = djs.find((d) => d.UserID.toString() === slot.BookedBy)
                        return dj ? djNames[dj.Username] || dj.DJName : slot.BookedBy
                      })()
                    : null

                  return (
                    <td key={`${day.toISOString()}-${hour}`} className="px-2 py-2">
                      <button
                        onClick={() => handleSlotClick(day, hour)}
                        className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                          slot?.BookedBy
                            ? "bg-purple-600/30 border border-purple-500/50 text-purple-200 hover:bg-purple-600/40"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30"
                        }`}
                      >
                        {slot?.BookedBy ? (
                          <div className="text-left">
                            <div className="truncate">{slot.ShowName}</div>
                            <div className="text-xs opacity-75">{djName}</div>
                          </div>
                        ) : (
                          <Plus className="w-4 h-4 mx-auto" />
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="bg-black/90 border border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Book a Show</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(accessLevel === "Management" || accessLevel === "Executive") && (
              <div>
                <label className="text-white/60 text-sm font-medium">Select DJ</label>
                <Select value={selectedDJ} onValueChange={setSelectedDJ}>
                  <SelectTrigger className="mt-1 bg-white/5 border border-white/10 text-white">
                    <SelectValue placeholder="Select a DJ" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border border-white/10">
                    {djs.map((dj) => (
                      <SelectItem key={dj.UserID} value={dj.UserID.toString()} className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <img
                            src={dj.ProfilePicture || "/placeholder.svg"}
                            alt={dj.DJName}
                            className="w-5 h-5 rounded-full"
                          />
                          {dj.DJName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-white/60 text-sm font-medium">Show Name</label>
              <Input
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                placeholder="Enter show name"
                className="mt-1 bg-white/5 border border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            {(accessLevel === "Management" || accessLevel === "Executive") && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="permshow"
                  checked={permShow}
                  onChange={(e) => setPermShow(e.target.checked)}
                  className="rounded border-white/20"
                />
                <label htmlFor="permshow" className="text-white text-sm">
                  Permanent Show
                </label>
              </div>
            )}

            <Button onClick={handleBookShow} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Book Show
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="bg-black/90 border border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Update Show</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-white/60 text-sm font-medium">Show Name</label>
              <Input
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                placeholder="Enter show name"
                className="mt-1 bg-white/5 border border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            {(accessLevel === "Management" || accessLevel === "Executive") && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="permshow-update"
                  checked={permShow}
                  onChange={(e) => setPermShow(e.target.checked)}
                  className="rounded border-white/20"
                />
                <label htmlFor="permshow-update" className="text-white text-sm">
                  Permanent Show
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleUpdateShow} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                Update Show
              </Button>
              <Button onClick={handleUnbook} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Unbook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
