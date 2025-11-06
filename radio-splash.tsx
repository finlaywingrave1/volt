"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Headphones, ChevronLeft, ChevronRight, Music, Calendar } from "lucide-react"
import Image from "next/image"
import { NavigationButtons } from "@/components/navigation-buttons"
import { RecentlyPlayed } from "@/components/recently-played"
import { Timetable } from "@/components/timetable" // Added Timetable import
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

// Discord SVG Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.4-2.172-1.27-2.172-1.27s.135.064.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.27.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34.002-.74.573-1.338 1.27-1.335zm-4.64 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34 0-.74.57-1.335 1.27-1.335z" />
  </svg>
)

export default function Component() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([100])
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeRocker, setShowVolumeRocker] = useState(true)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isPlayButtonPressed, setIsPlayButtonPressed] = useState(false)
  const [forcedLoading, setForcedLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [logoClickCount, setLogoClickCount] = useState(0)
  const [logoClickTimer, setLogoClickTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPlaygroundMode, setIsPlaygroundMode] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState(false)

  const [showRecentlyPlayed, setShowRecentlyPlayed] = useState(false)
  const [showTimetable, setShowTimetable] = useState(false)

  useEffect(() => {
    const storedProfileUrl = localStorage.getItem("profileUrl")
    const storedIsStaff = localStorage.getItem("isStaff")

    setIsLoggedIn(!!storedProfileUrl)
    setProfileUrl(storedProfileUrl)
    setIsStaff(storedIsStaff === "true")
  }, [])

  // Handle 404 redirects
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname !== "/") {
        window.location.href = "/"
      }
    }

    // Check current path and redirect if not root
    if (window.location.pathname !== "/") {
      window.location.href = "/"
    }

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("https://manage.voltradio.lol/listen/voltradio/radio.mp3")
    audioRef.current.volume = 1.0 // 100% volume
    audioRef.current.crossOrigin = "anonymous"

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  // Function to get album art from Last.fm API with new credentials
  const getAlbumArt = async (artist: string, title: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=55d2feb3e9cc9c512a7ba0f20911d3d4&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`,
      )
      const data = await response.json()

      // Get the largest available image
      const images = data.track?.album?.image || []
      const largeImage =
        images.find((img: any) => img.size === "extralarge") ||
        images.find((img: any) => img.size === "large") ||
        images.find((img: any) => img.size === "medium")

      return largeImage?.["#text"] || "https://api.finlayw.cloud/v1/imagecdn/volt/public/fallback-logo.webp"
    } catch (error) {
      console.error("Failed to fetch album art:", error)
      return "https://api.finlayw.cloud/v1/imagecdn/volt/public/diverse-group-making-music.png"
    }
  }

  // Fetch playground data from secondary Azuracast API
  const fetchPlaygroundData = async () => {
    try {
      const response = await fetch("https://manage.voltradio.lol/api/nowplaying/playground", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        cache: "no-cache",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const artist = data.now_playing?.song?.artist || "Playground Artist"
      const title = data.now_playing?.song?.title || "Playground Track"

      const albumArt = await getAlbumArt(artist, title)

      setNowPlaying({
        station: {
          name: "VoltRadio Playground",
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
          total: 0,
          unique: 0,
        },
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch playground data:", error)
      setNowPlaying({
        station: {
          name: "VoltRadio Playground",
        },
        now_playing: {
          song: {
            title: "Playground Mode",
            artist: "VoltRadio",
            art: "https://api.finlayw.cloud/v1/imagecdn/volt/public/fallback-logo.webp",
          },
          streamer: null,
          is_live: false,
        },
        listeners: {
          total: 0,
          unique: 0,
        },
      })
      setIsLoading(false)
    }
  }

  const fetchNowPlaying = async () => {
    try {
      const apiUrl = isPlaygroundMode
        ? "https://manage.voltradio.lol/api/nowplaying/playground"
        : "https://manage.voltradio.lol/api/nowplaying/voltradio"

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        cache: "no-cache",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const artist = data.now_playing?.song?.artist || "Unknown Artist"
      const title = data.now_playing?.song?.title || "Unknown Track"
      const streamer = data.live?.streamer_name || null
      const isLive = data.live?.is_live || false

      const albumArt = await getSpotifyAlbumArt(artist, title)

      setNowPlaying({
        station: {
          name: isPlaygroundMode ? "VoltRadio Playground" : data.station?.name || "VoltRadio",
        },
        now_playing: {
          song: {
            title: title,
            artist: artist,
            art: albumArt,
          },
          streamer: streamer,
          is_live: isLive,
        },
        listeners: {
          total: isPlaygroundMode ? 0 : data.listeners?.total || 0,
          unique: isPlaygroundMode ? 0 : data.listeners?.unique || 0,
        },
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch now playing data:", error)

      setNowPlaying({
        station: {
          name: "VoltRadio",
        },
        now_playing: {
          song: {
            title: "Unable to load track info",
            artist: "VoltRadio",
            art: "https://api.finlayw.cloud/v1/imagecdn/volt/public/diverse-group-making-music.png",
          },
          streamer: null,
          is_live: false,
        },
        listeners: {
          total: 0,
          unique: 0,
        },
      })

      setIsLoading(false)

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        fetchNowPlaying()
      }, 5000)
    }
  }

  useEffect(() => {
    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 10000) // Update every 10 seconds

    const trackSongs = async () => {
      try {
        await fetch("/api/track-songs", {
          method: "GET",
        })
      } catch (error) {
        console.error("[v0] Failed to trigger song tracking:", error)
      }
    }

    // Initial call
    trackSongs()

    const trackingInterval = setInterval(trackSongs, 60000)

    // Add forced loading timer
    const timer = setTimeout(() => {
      setForcedLoading(false)
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(trackingInterval)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      clearTimeout(timer)
    }
  }, [isPlaygroundMode])

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  const openDiscord = () => {
    window.open("https://discord.gg/GYyDGZxwSS", "_blank")
  }

  const openLastFm = () => {
    if (nowPlaying?.now_playing.song.artist && nowPlaying?.now_playing.song.title) {
      const artist = encodeURIComponent(nowPlaying.now_playing.song.artist)
      const track = encodeURIComponent(nowPlaying.now_playing.song.title)
      window.open(`https://www.last.fm/music/${artist}/_/${track}`, "_blank")
    }
  }

  const openArtistLastFm = () => {
    if (nowPlaying?.now_playing.song.artist) {
      const artist = encodeURIComponent(nowPlaying.now_playing.song.artist)
      window.open(`https://www.last.fm/music/${artist}`, "_blank")
    }
  }

  const togglePlayPause = async () => {
    if (!audioRef.current) return

    setIsPlayButtonPressed(true)
    setTimeout(() => setIsPlayButtonPressed(false), 150)

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

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (newVolume[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVolumeRocker = () => {
    setShowVolumeRocker(!showVolumeRocker)
  }

  const getClientY = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      return e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0
    }
    return e.clientY
  }

  const handleSliderInteraction = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const clientY = getClientY(e)
      const y = clientY - rect.top
      const percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100))
      handleVolumeChange([Math.round(percentage)])
    }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    handleSliderInteraction(e)

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      handleSliderInteraction(e)
    }

    const handleEnd = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleMove)
      document.removeEventListener("touchend", handleEnd)
    }

    document.addEventListener("mousemove", handleMove, { passive: false })
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchmove", handleMove, { passive: false })
    document.addEventListener("touchend", handleEnd)
  }

  const handleLogoClick = () => {
    setLogoClickCount((prev) => prev + 1)

    if (logoClickTimer) {
      clearTimeout(logoClickTimer)
    }

    const timer = setTimeout(() => {
      setLogoClickCount(0)
    }, 3000)

    setLogoClickTimer(timer)

    if (logoClickCount + 1 >= 4) {
      // Enter playground mode with 4 clicks
      setIsPlaygroundMode(true)
      setLogoClickCount(0)
      if (logoClickTimer) {
        clearTimeout(logoClickTimer)
      }

      if (audioRef.current) {
        const wasPlaying = isPlaying
        audioRef.current.pause()
        audioRef.current.src = "https://manage.voltradio.lol/listen/playground/radio.mp3"

        if (wasPlaying) {
          audioRef.current.play().catch(console.error)
        }
      }

      // Immediately fetch playground API data
      fetchPlaygroundData()
    } else if (logoClickCount + 1 >= 3) {
      // Leave playground mode with 3 clicks (only if already in playground mode)
      if (isPlaygroundMode) {
        setIsPlaygroundMode(false)
        setLogoClickCount(0)
        if (logoClickTimer) {
          clearTimeout(logoClickTimer)
        }

        if (audioRef.current) {
          const wasPlaying = isPlaying
          audioRef.current.pause()
          audioRef.current.src = "https://manage.voltradio.lol/listen/voltradio/radio.mp3"

          if (wasPlaying) {
            audioRef.current.play().catch(console.error)
          }
        }

        // Immediately fetch normal API data
        fetchNowPlaying()
      }
    }
  }

  const handleLogin = () => {
    window.location.href = "/login"
  }

  const handleMyProfile = () => {
    const userID = localStorage.getItem("UserID")
    if (userID) {
      window.location.href = `/profile?userID=${userID}`
    }
  }

  const handleSettings = () => {
    // TODO: Implement settings navigation
    console.log("Settings clicked")
  }

  const handleLogout = () => {
    localStorage.removeItem("profileUrl")
    localStorage.removeItem("isStaff")
    setIsLoggedIn(false)
    setProfileUrl(null)
    setIsStaff(false)
  }

  const handleMyVolt = () => {
    window.location.href = "/myvolt"
  }

  const handleLatestNews = () => {
    // TODO: Implement latest news navigation
    console.log("Latest News clicked")
  }

  const handleOurTeam = () => {
    // TODO: Implement our team navigation
    console.log("Our Team clicked")
  }

  const handleJoinTheTeam = () => {
    // TODO: Implement join the team navigation
    console.log("Join The Team clicked")
  }

  if (isLoading || forcedLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
        {/* Blurred Background - Default image during loading */}
        <div
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(https://api.finlayw.cloud/v1/imagecdn/volt/public/diverse-group-making-music.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(60px) brightness(0.2)",
            transform: "scale(1.1)",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        </div>

        {/* Copyright Text - Bottom center - Always visible */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="text-white/30 text-xs font-bold">© VoltRadio 2025</div>
        </div>
      </div>
    )
  }

  const blurredBackgroundStyle = {
    backgroundImage: `url(${nowPlaying?.now_playing.song.art || "https://api.finlayw.cloud/v1/imagecdn/volt/public/diverse-group-making-music.png"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: "blur(60px) brightness(0.2)",
    transform: "scale(1.1)",
  }

  const currentVolume = isMuted ? 0 : volume[0]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins'] [font-feature-settings:'ss01'] [font-variant-numeric:tabular-nums]">
      {/* Blurred Background */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out" style={blurredBackgroundStyle} />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons
          showVolumeToggle={true}
          onVolumeToggle={toggleVolumeRocker}
          showVolumeRocker={showVolumeRocker}
        />
      </div>

      <button
        onClick={() => setShowRecentlyPlayed(!showRecentlyPlayed)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 backdrop-blur-sm border border-white/10 border-l-0 rounded-r-xl p-3 hover:bg-black/70 transition-all duration-300 hover:pr-4 group shadow-lg"
        aria-label={showRecentlyPlayed ? "Hide Recently Played" : "Show Recently Played"}
      >
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
          {showRecentlyPlayed ? (
            <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5" />
          )}
        </div>
      </button>

      <button
        onClick={() => setShowTimetable(!showTimetable)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 backdrop-blur-sm border border-white/10 border-r-0 rounded-l-xl p-3 hover:bg-black/70 transition-all duration-300 hover:pl-4 group shadow-lg"
        aria-label={showTimetable ? "Hide Timetable" : "Show Timetable"}
      >
        <div className="flex items-center gap-2">
          {showTimetable ? (
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:-translate-x-0.5" />
          )}
          <Calendar className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
        </div>
      </button>

      {/* Content - Scaled down */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 scale-90 pt-20">
        <div className="w-full max-w-6xl mx-auto">
          <div
            className={`grid gap-6 items-start transition-all duration-300 ${
              showRecentlyPlayed && showTimetable
                ? "grid-cols-1 lg:grid-cols-3"
                : showRecentlyPlayed || showTimetable
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
            }`}
          >
            {/* Left column - Recently Played */}
            <div
              className={`lg:col-span-1 order-2 lg:order-1 transition-all duration-500 ease-in-out ${
                showRecentlyPlayed ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95 hidden"
              }`}
            >
              <RecentlyPlayed />
            </div>

            {/* Center column - Main Player */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              {/* Station Header - Logo only - Clickable */}
              <div className="text-center mb-8">
                <Image
                  src="https://api.finlayw.cloud/v1/imagecdn/volt/public/voltradio-logo.png"
                  alt="VoltRadio"
                  width={200}
                  height={60}
                  className="mx-auto opacity-80 cursor-pointer hover:opacity-100 transition-opacity duration-200"
                  onClick={handleLogoClick}
                  draggable="false"
                  priority
                />
              </div>

              {/* Main Player - Album cover centered */}
              <div className="flex flex-col items-center">
                {/* Album Art with Volume Control on the side */}
                <div className="relative mb-3">
                  {/* Album Art with Play Button - Centered */}
                  <div className="relative group mx-auto">
                    <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl bg-black/20">
                      {nowPlaying?.now_playing.song.art && (
                        <Image
                          src={nowPlaying.now_playing.song.art || "/placeholder.svg"}
                          alt="Album Art"
                          width={256}
                          height={256}
                          className="w-full h-full object-cover transition-all duration-500"
                          priority
                        />
                      )}
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={togglePlayPause}
                          className={`p-4 rounded-full transition-all duration-200 hover:scale-110 outline-none focus:outline-none ${
                            isPlayButtonPressed ? "scale-95" : ""
                          }`}
                        >
                          {isPlaying ? (
                            <Pause
                              className="w-20 h-20 text-white drop-shadow-lg transition-all duration-200"
                              fill="currentColor"
                              stroke="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          ) : (
                            <Play
                              className="w-20 h-20 text-white drop-shadow-lg ml-1 transition-all duration-200"
                              fill="currentColor"
                              stroke="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div
                      className={`absolute right-[-70px] top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-2 h-64 bg-black/50 backdrop-blur-sm rounded-2xl px-2 py-3 border border-white/10 transition-all duration-500 ${
                        showVolumeRocker ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                      }`}
                    >
                      <Button
                        onClick={toggleMute}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white p-2 hover:bg-transparent rounded-full transition-colors duration-200"
                      >
                        {isMuted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>

                      <div
                        ref={sliderRef}
                        className="h-52 w-5 flex items-center justify-center relative cursor-pointer touch-none select-none my-2"
                        onMouseDown={handleStart}
                        onTouchStart={handleStart}
                      >
                        <div className="absolute w-1 h-full bg-white/60 rounded-full"></div>

                        <div
                          className="absolute w-1 bg-blue-500 rounded-full transition-all duration-150 bottom-0"
                          style={{
                            height: `${currentVolume}%`,
                          }}
                        ></div>

                        <div
                          className={`absolute w-3 h-3 bg-white rounded-full shadow-lg cursor-pointer z-10 transition-all duration-150 ${isDragging ? "scale-110" : ""} -translate-y-1/2`}
                          style={{
                            bottom: `calc(${currentVolume}% - 6px)`,
                          }}
                        ></div>
                      </div>

                      <span className="text-white/60 text-xs font-bold font-mono">{Math.round(currentVolume)}</span>
                    </div>
                  </div>
                </div>

                {/* Text Information */}
                <div className="text-center w-full">
                  {/* DJ Status */}
                  <div className="mb-2">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          nowPlaying?.now_playing.is_live && nowPlaying?.now_playing.streamer
                            ? "bg-green-400 animate-pulse"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-base text-white/80 font-medium tracking-wide">
                        {nowPlaying?.now_playing.is_live && nowPlaying?.now_playing.streamer
                          ? nowPlaying.now_playing.streamer
                          : "AutoDJ"}
                      </span>
                      {nowPlaying?.now_playing.is_live && nowPlaying?.now_playing.streamer && (
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                          <Image
                            src={`https://manage.voltradio.lol/api/station/1/streamer/${encodeURIComponent(nowPlaying.now_playing.streamer)}/art?t=${Date.now()}`}
                            alt={`${nowPlaying.now_playing.streamer} profile`}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              const container = target.parentElement
                              if (container) {
                                container.style.display = "none"
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Song Title */}
                  <h2
                    className="text-xl font-bold text-white mb-1 leading-tight cursor-pointer hover:text-blue-300 transition-colors duration-200"
                    onClick={openLastFm}
                  >
                    {nowPlaying?.now_playing.song.title}
                  </h2>

                  {/* Artist Name */}
                  <p
                    className="text-sm text-white/70 mb-1 font-bold cursor-pointer hover:text-blue-300 transition-colors duration-200"
                    onClick={openArtistLastFm}
                  >
                    {nowPlaying?.now_playing.song.artist}
                  </p>

                  {/* Listener count or Playground mode text */}
                  <div className="text-white/30 text-xs font-bold mt-2 flex items-center justify-center gap-1">
                    {isPlaygroundMode ? (
                      "You are currently in Playground Mode, press the logo 3 times to exit"
                    ) : (
                      <>
                        <Headphones className="w-3 h-3" />
                        {nowPlaying?.listeners.unique} listening
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Timetable */}
            <div
              className={`lg:col-span-1 order-3 transition-all duration-500 ease-in-out ${
                showTimetable ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95 hidden"
              }`}
            >
              <Timetable />
            </div>
          </div>
        </div>
      </div>
      {/* Copyright Text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-white/30 text-xs font-bold">© VoltRadio 2025</div>
      </div>
    </div>
  )
}
