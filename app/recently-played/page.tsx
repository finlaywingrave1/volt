"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Music2, Clock, AlertCircle, ArrowLeft } from "lucide-react"
import { getRecentSongs, type RecentSong } from "@/lib/spotify"
import { Button } from "@/components/ui/button"
import { NavigationButtons } from "@/components/navigation-buttons"

export default function RecentlyPlayedPage() {
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchRecentSongs = async () => {
    try {
      const songs = await getRecentSongs(50) // Get more songs for the full page
      setRecentSongs(songs)
      setHasError(songs.length === 0)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch recent songs:", error)
      setHasError(true)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentSongs()
    // Update every 30 seconds
    const interval = setInterval(fetchRecentSongs, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
      {/* Blurred Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(https://api.finlayw.cloud/v1/imagecdn/volt/public/diverse-group-making-music.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) brightness(0.2)",
          transform: "scale(1.1)",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Navigation */}
      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons showVolumeToggle={false} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => (window.location.href = "/")}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Music2 className="w-8 h-8" />
              Recently Played
            </h1>
            <p className="text-white/60">All songs played on VoltRadio</p>
          </div>

          {/* Songs List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSongs.map((song) => (
                <div
                  key={song.SongID}
                  className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-black/50 transition-all duration-200"
                >
                  {/* Album Art */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/20">
                    <Image
                      src={song.albumArt || "/fallback-logo.webp"}
                      alt={`${song.Title} album art`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base truncate">{song.Title}</h3>
                    <p className="text-white/70 text-sm truncate">{song.Artist}</p>
                    <p className="text-white/50 text-xs truncate">Played by {song.PlayedBy}</p>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-end gap-1 text-white/40 text-xs flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(song.PlayedAt)}
                    </div>
                    <div className="text-white/30 text-xs">{formatFullDate(song.PlayedAt)}</div>
                  </div>
                </div>
              ))}

              {recentSongs.length === 0 && hasError && (
                <div className="text-center py-20 text-white/50">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold mb-2">Unable to load recent songs</p>
                  <p className="text-sm text-white/30">The server may be temporarily unavailable</p>
                </div>
              )}

              {recentSongs.length === 0 && !hasError && (
                <div className="text-center py-20 text-white/50">
                  <Music2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold">No recent songs yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-white/30 text-xs font-bold">© VoltRadio 2025</div>
      </div>
    </div>
  )
}
