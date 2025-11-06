"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import { getSpotifyAlbumArt } from "@/lib/spotify"

interface NowPlayingData {
  station: {
    name: string
  }
  now_playing: {
    song: {
      title: string
      artist: string
      art: string
    }
    streamer: string | null
    is_live: boolean
  }
  listeners: {
    total: number
    unique: number
  }
}

export function MiniPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([100])
  const [isMuted, setIsMuted] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("https://manage.voltradio.lol/listen/voltradio/radio.mp3")
    audioRef.current.volume = 1.0
    audioRef.current.crossOrigin = "anonymous"

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Fetch now playing data
  const fetchNowPlaying = async () => {
    try {
      const response = await fetch("https://manage.voltradio.lol/api/nowplaying/voltradio", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        cache: "no-cache",
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      const artist = data.now_playing?.song?.artist || "Unknown Artist"
      const title = data.now_playing?.song?.title || "Unknown Track"

      // Fetch album art from Spotify
      const albumArt = await getSpotifyAlbumArt(artist, title)

      setNowPlaying({
        station: {
          name: data.station?.name || "VoltRadio",
        },
        now_playing: {
          song: {
            title: title,
            artist: artist,
            art: albumArt,
          },
          streamer: data.live?.streamer_name || null,
          is_live: data.live?.is_live || false,
        },
        listeners: {
          total: data.listeners?.total || 0,
          unique: data.listeners?.unique || 0,
        },
      })
    } catch (error) {
      console.error("Failed to fetch now playing data:", error)
    }
  }

  useEffect(() => {
    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 10000)
    return () => clearInterval(interval)
  }, [])

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  const togglePlayPause = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-4">
        {/* Album Art */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/20">
          {nowPlaying?.now_playing.song.art && (
            <Image
              src={nowPlaying.now_playing.song.art || "/placeholder.svg"}
              alt="Album Art"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {nowPlaying?.now_playing.song.title || "Loading..."}
          </h3>
          <p className="text-white/60 text-xs truncate">{nowPlaying?.now_playing.song.artist || "VoltRadio"}</p>
          <div className="flex items-center gap-1 mt-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                nowPlaying?.now_playing.is_live && nowPlaying?.now_playing.streamer
                  ? "bg-green-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="text-white/40 text-xs">
              {nowPlaying?.now_playing.is_live && nowPlaying?.now_playing.streamer
                ? nowPlaying.now_playing.streamer
                : "AutoDJ"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={togglePlayPause}
            variant="ghost"
            size="sm"
            className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4" fill="currentColor" />
            )}
          </Button>

          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all duration-200"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
