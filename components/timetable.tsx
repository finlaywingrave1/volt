"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Clock, User, AlertCircle } from "lucide-react"

interface TimetableSlot {
  BookedBy: string
  PermShow: boolean
  ShowName: string
  Timestamp: string
}

interface DJInfo {
  FullName: string
  profileUrl: string
}

export function Timetable() {
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [djInfo, setDjInfo] = useState<Record<string, DJInfo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchTimetable = async () => {
    try {
      const response = await fetch("https://api.finlayw.cloud/v1/volt/timetable", {
        headers: {
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch timetable")
      }

      const data = await response.json()

      const now = new Date()
      const hourlySlots: TimetableSlot[] = []

      for (let i = 0; i < 5; i++) {
        // Start from the current hour, not current time
        const slotTime = new Date(now)
        slotTime.setHours(now.getHours() + i)
        slotTime.setMinutes(0)
        slotTime.setSeconds(0)
        slotTime.setMilliseconds(0)

        // Find if there's a booking for this hour
        const existingSlot = data.find((slot: TimetableSlot) => {
          const slotDate = new Date(slot.Timestamp)
          return (
            slotDate.getFullYear() === slotTime.getFullYear() &&
            slotDate.getMonth() === slotTime.getMonth() &&
            slotDate.getDate() === slotTime.getDate() &&
            slotDate.getHours() === slotTime.getHours()
          )
        })

        if (existingSlot) {
          hourlySlots.push(existingSlot)
        } else {
          // Create AutoDJ slot at the top of the hour
          hourlySlots.push({
            BookedBy: "0",
            PermShow: false,
            ShowName: "AutoDJ",
            Timestamp: slotTime.toISOString(),
          })
        }
      }

      setSlots(hourlySlots)

      // Fetch DJ info for booked slots
      const djIds = [...new Set(hourlySlots.filter((slot) => slot.BookedBy !== "0").map((slot) => slot.BookedBy))]

      const djInfoPromises = djIds.map(async (id) => {
        try {
          const response = await fetch(`https://api.finlayw.cloud/v1/volt/users/user/${id}`)
          if (response.ok) {
            const data = await response.json()
            return { id, info: { FullName: data.FullName, profileUrl: data.profileUrl } }
          }
        } catch (error) {
          console.error(`Failed to fetch DJ info for ${id}:`, error)
        }
        return null
      })

      const djInfoResults = await Promise.all(djInfoPromises)
      const djInfoMap: Record<string, DJInfo> = {}
      djInfoResults.forEach((result) => {
        if (result) {
          djInfoMap[result.id] = result.info
        }
      })

      setDjInfo(djInfoMap)
      setIsLoading(false)
      setHasError(false)
    } catch (error) {
      console.error("Failed to fetch timetable:", error)
      setHasError(true)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTimetable()
    // Update every 5 minutes
    const interval = setInterval(fetchTimetable, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timetable
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Timetable
      </h2>

      <div className="space-y-3">
        {slots.map((slot, index) => {
          const isAutoDJ = slot.BookedBy === "0"
          const dj = !isAutoDJ ? djInfo[slot.BookedBy] : null

          return (
            <div
              key={index}
              className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all duration-200"
            >
              {/* Time */}
              <div className="flex flex-col items-center justify-center bg-black/30 rounded-lg p-2 flex-shrink-0 w-16">
                <Clock className="w-4 h-4 text-white/60 mb-1" />
                <span className="text-white/80 text-xs font-bold">{formatTime(slot.Timestamp)}</span>
              </div>

              {/* DJ/Show Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">{slot.ShowName}</h3>
                {!isAutoDJ && dj ? (
                  <p className="text-white/60 text-xs truncate">with {dj.FullName}</p>
                ) : (
                  <p className="text-white/40 text-xs">Automated playlist</p>
                )}
                {slot.PermShow && <p className="text-blue-400 text-xs">Permanent Show</p>}
              </div>

              {/* DJ Profile Picture */}
              {!isAutoDJ && dj?.profileUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                  <Image
                    src={dj.profileUrl || "/placeholder.svg"}
                    alt={dj.FullName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white/40" />
                </div>
              )}
            </div>
          )
        })}

        {slots.length === 0 && hasError && (
          <div className="text-center py-8 text-white/50">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Unable to load timetable</p>
            <p className="text-xs text-white/30 mt-1">The server may be temporarily unavailable</p>
          </div>
        )}
      </div>
    </div>
  )
}
