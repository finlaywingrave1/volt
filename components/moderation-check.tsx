"use client"

import { useEffect, useState } from "react"
import { WarningOverlay } from "./warning-overlay"
import { useUser } from "@auth0/nextjs-auth0"

interface Warning {
  WarningID: number
  Timestamp: string
  WarnedBy: string
  Reason: string
}

interface TempBan {
  TempBanID: number
  Timestamp: string
  BannedBy: string
  Reason: string
  BannedUntil: string
}

interface Ban {
  BanID: number
  Timestamp: string
  IPAddress?: string
  BannedBy: string
  Reason: string
}

interface ModerationStatus {
  warnings: Warning[]
  tempbans: TempBan[]
  bans: Ban[]
}

export function ModerationCheck() {
  const { user } = useUser()
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkModerationStatus()
  }, [user])

  const checkModerationStatus = async () => {
    try {
      const userId = user?.sub || localStorage.getItem("dj_UserID")

      if (!userId) {
        setIsChecking(false)
        return
      }

      console.log("[v0] Checking moderation status for user:", userId)

      const response = await fetch(`/api/moderation/check/${userId}`)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Moderation status response:", data)

        setModerationStatus({
          warnings: data.warnings || [],
          tempbans: data.tempbans || [],
          bans: data.bans || [],
        })
      } else {
        console.error("[v0] Moderation check failed with status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Failed to check moderation status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleAcceptWarning = async (warningId: number) => {
    try {
      const response = await fetch(`/api/moderation/warnings/accept/${warningId}`, {
        method: "PATCH",
      })

      if (response.ok) {
        setModerationStatus((prev) => {
          if (!prev) return null
          return {
            ...prev,
            warnings: prev.warnings.filter((w) => w.WarningID !== warningId),
          }
        })
      }
    } catch (error) {
      console.error("[v0] Failed to accept warning:", error)
    }
  }

  if (moderationStatus?.warnings && moderationStatus.warnings.length > 0) {
    return <WarningOverlay warning={moderationStatus.warnings[0]} onAccept={handleAcceptWarning} />
  }

  if (moderationStatus?.bans && moderationStatus.bans.length > 0) {
    const ban = moderationStatus.bans[0]
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-950/50 backdrop-blur-xl border-2 border-red-500 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Account Banned</h1>
          <p className="text-white/80 mb-2">Your account has been permanently banned.</p>
          <p className="text-white/60 text-sm mb-4">Reason: {ban.Reason}</p>
          <p className="text-white/40 text-xs">Banned by: {ban.BannedBy}</p>
          {ban.IPAddress && <p className="text-white/40 text-xs mt-2">IP: {ban.IPAddress}</p>}
        </div>
      </div>
    )
  }

  if (moderationStatus?.tempbans && moderationStatus.tempbans.length > 0) {
    const tempban = moderationStatus.tempbans[0]
    const bannedUntil = new Date(tempban.BannedUntil).toLocaleString()
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-orange-950/50 backdrop-blur-xl border-2 border-orange-500 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-3xl font-bold text-orange-400 mb-4">Temporary Ban</h1>
          <p className="text-white/80 mb-2">Your account has been temporarily banned.</p>
          <p className="text-white/60 text-sm mb-4">Reason: {tempban.Reason}</p>
          <p className="text-white/40 text-xs">Banned by: {tempban.BannedBy}</p>
          <p className="text-white/40 text-xs mt-2">Banned until: {bannedUntil}</p>
        </div>
      </div>
    )
  }

  return null
}
