"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Music2, Clock, AlertCircle, ArrowRight } from "lucide-react"
import { getRecentSongs, type RecentSong } from "@/lib/spotify"
import { Button } from "@/components/ui/button"

export function RecentlyPlayed() {
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchRecentSongs = async () => {
    try {
      const songs = await getRecentSongs(5)
      setRecentSongs(songs)
      setHasError(false)
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

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Music2 className="w-5 h-5" />
          Recently Played
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Music2 className="w-5 h-5" />
          Recently Played
        </h2>
        <Button
          onClick={() => (window.location.href = "/recently-played")}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white text-xs flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {recentSongs.map((song) => (
          <div
            key={song.SongID}
            className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all duration-200"
          >
            {/* Album Art */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
              <Image
                src={song.albumArt || "/fallback-logo.webp"}
                alt={`${song.Title} album art`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{song.Title}</h3>
              <p className="text-white/60 text-xs truncate">{song.Artist}</p>
              <p className="text-white/40 text-xs truncate">Played by {song.PlayedBy}</p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(song.PlayedAt)}
            </div>
          </div>
        ))}

        {recentSongs.length === 0 && !hasError && (
          <div className="text-center py-8 text-white/50">
            <Music2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nothing here</p>
          </div>
        )}

        {hasError && (
          <div className="text-center py-8 text-white/50">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Unable to load recent songs</p>
            <p className="text-xs text-white/30 mt-1">The server may be temporarily unavailable</p>
          </div>
        )}
      </div>
    </div>
  )
}
