"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { Button } from "@/components/ui/button"
import { TimetableDisplay } from "@/components/timetable-display"
import { Home, Radio, BookOpen, ChevronDown, Trash2, Calendar, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { getSpotifyAlbumArt } from "@/lib/spotify"

interface DJBiblePage {
  id: string
  title: string
  author: string
  content: string
  created_at: string
}

interface Request {
  Message: string
  Source: string
  Timestamp: string
  Type: string
  Username: string
}

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
  }
}

export default function DJAreaPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<"home" | "requests" | "bible" | "timetable">("home")
  const [djBibleOpen, setDjBibleOpen] = useState(false)
  const [djBiblePages, setDjBiblePages] = useState<DJBiblePage[]>([])
  const [selectedBiblePage, setSelectedBiblePage] = useState<DJBiblePage | null>(null)
  const [loadingBible, setLoadingBible] = useState(false)
  const [requests, setRequests] = useState<Request[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [lastPlayed, setLastPlayed] = useState<{ title: string; artist: string; art: string } | null>(null)

  useEffect(() => {
    // Check if user has DJ, Management, or Executive access
    const accessLevel = localStorage.getItem("dj_AccessLevel")

    if (!accessLevel) {
      router.push("/myvolt/login")
      return
    }

    if (accessLevel !== "DJ" && accessLevel !== "Management" && accessLevel !== "Executive") {
      router.push("/myvolt")
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router])

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

      // Store previous song as last played
      if (nowPlaying && nowPlaying.now_playing.song.title !== title) {
        setLastPlayed({
          title: nowPlaying.now_playing.song.title,
          artist: nowPlaying.now_playing.song.artist,
          art: nowPlaying.now_playing.song.art,
        })
      }

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
        },
      })
    } catch (error) {
      console.error("Failed to fetch now playing data:", error)
    }
  }

  useEffect(() => {
    if (activeView === "home") {
      fetchNowPlaying()
      const interval = setInterval(fetchNowPlaying, 10000)
      return () => clearInterval(interval)
    }
  }, [activeView])

  const fetchRequests = async () => {
    // Don't show loading state on subsequent fetches to avoid flashing
    if (requests.length === 0) {
      setLoadingRequests(true)
    }

    try {
      const response = await fetch("https://api.finlayw.cloud/v1/volt/request", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      console.log("[v0] First request from API:", data[0])
      console.log("[v0] Timestamp value:", data[0]?.Timestamp)
      console.log("[v0] Timestamp type:", typeof data[0]?.Timestamp)

      // Sort: Staff first, then oldest first
      const sorted = data.sort((a: Request, b: Request) => {
        if (a.Type === "Staff" && b.Type !== "Staff") return -1
        if (a.Type !== "Staff" && b.Type === "Staff") return 1
        return new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
      })

      setRequests(sorted)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      if (requests.length === 0) {
        setLoadingRequests(false)
      }
    }
  }

  const deleteRequest = async (timestamp: string) => {
    try {
      const isoTimestamp = new Date(timestamp).toISOString()
      console.log("[v0] Original timestamp:", timestamp)
      console.log("[v0] Converted to ISO:", isoTimestamp)

      const response = await fetch(`/api/requests/${encodeURIComponent(isoTimestamp)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      setRequests((prevRequests) => prevRequests.filter((req) => req.Timestamp !== timestamp))

      await fetchRequests()
    } catch (error) {
      console.error("Failed to delete request:", error)
      await fetchRequests()
    }
  }

  useEffect(() => {
    if (activeView === "requests") {
      fetchRequests()
      const interval = setInterval(fetchRequests, 60000)
      return () => clearInterval(interval)
    }
  }, [activeView])

  const getRequestColor = (type: string) => {
    switch (type) {
      case "Request":
        return "border-blue-500/50 bg-blue-500/10"
      case "Shoutout":
        return "border-green-500/50 bg-green-500/10"
      case "Message":
        return "border-gray-500/50 bg-gray-500/10"
      case "Competition Answer":
        return "border-yellow-500/50 bg-yellow-500/10"
      case "Staff":
        return "border-purple-500/50 bg-purple-500/10"
      default:
        return "border-white/10 bg-white/5"
    }
  }

  const getRequestTextColor = (type: string) => {
    switch (type) {
      case "Request":
        return "text-blue-400"
      case "Shoutout":
        return "text-green-400"
      case "Message":
        return "text-gray-400"
      case "Competition Answer":
        return "text-yellow-400"
      case "Staff":
        return "text-purple-400"
      default:
        return "text-white"
    }
  }

  const fetchDJBiblePages = async () => {
    setLoadingBible(true)
    try {
      const response = await fetch("/api/djbible")
      if (!response.ok) throw new Error("Failed to fetch DJ Bible pages")
      const data = await response.json()
      setDjBiblePages(data)
      if (data.length > 0 && !selectedBiblePage) {
        setSelectedBiblePage(data[0])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch DJ Bible pages:", error)
    } finally {
      setLoadingBible(false)
    }
  }

  useEffect(() => {
    fetchDJBiblePages()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950 font-['Poppins']">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons showVolumeToggle={true} />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => router.push("/myvolt")}
          variant="ghost"
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 text-white hover:bg-slate-800/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to MyVolt
        </Button>
      </div>

      <div className="relative z-10 min-h-screen flex p-6 gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl sticky top-6">
            <h2 className="text-2xl font-bold text-white mb-6">DJ Area</h2>

            <div className="space-y-2">
              <Button
                onClick={() => setActiveView("home")}
                variant="ghost"
                className={`w-full justify-start gap-3 text-left transition-all ${
                  activeView === "home"
                    ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Home Page</span>
              </Button>

              <Button
                onClick={() => setActiveView("requests")}
                variant="ghost"
                className={`w-full justify-start gap-3 text-left transition-all ${
                  activeView === "requests"
                    ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Radio className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Request Line</span>
              </Button>

              <Button
                onClick={() => setActiveView("timetable")}
                variant="ghost"
                className={`w-full justify-start gap-3 text-left transition-all ${
                  activeView === "timetable"
                    ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Timetable</span>
              </Button>

              <div>
                <Button
                  onClick={() => {
                    setActiveView("bible")
                    setDjBibleOpen(!djBibleOpen)
                  }}
                  variant="ghost"
                  className={`w-full justify-start gap-3 text-left transition-all ${
                    activeView === "bible"
                      ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate flex-1">DJ Bible</span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${djBibleOpen ? "rotate-180" : ""}`}
                  />
                </Button>

                {djBibleOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {loadingBible ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      </div>
                    ) : djBiblePages.length === 0 ? (
                      <p className="text-white/40 text-xs px-2 py-1">No pages available</p>
                    ) : (
                      djBiblePages.map((page) => (
                        <Button
                          key={page.id}
                          onClick={() => {
                            setSelectedBiblePage(page)
                            setActiveView("bible")
                          }}
                          variant="ghost"
                          className={`w-full justify-start text-sm text-left transition-all ${
                            selectedBiblePage?.id === page.id
                              ? "bg-white/10 text-white"
                              : "text-white/40 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="truncate">{page.title}</span>
                        </Button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <MiniPlayer />
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Home Page View */}
            {activeView === "home" && (
              <div>
                <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Currently Playing */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-600/50 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      Currently Playing
                    </h2>
                    {nowPlaying ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/30 ring-2 ring-slate-700/50 shadow-lg">
                          <Image
                            src={nowPlaying.now_playing.song.art || "/placeholder.svg"}
                            alt="Album Art"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg truncate leading-tight">
                            {nowPlaying.now_playing.song.title}
                          </h3>
                          <p className="text-white/60 truncate mt-1">{nowPlaying.now_playing.song.artist}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                nowPlaying.now_playing.is_live && nowPlaying.now_playing.streamer
                                  ? "bg-green-400 animate-pulse"
                                  : "bg-red-400"
                              }`}
                            />
                            <span className="text-white/40 text-sm">
                              {nowPlaying.now_playing.is_live && nowPlaying.now_playing.streamer
                                ? nowPlaying.now_playing.streamer
                                : "AutoDJ"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/40">Loading...</p>
                    )}
                  </div>

                  {/* Last Played */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-600/50 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-white mb-4">Last Played</h2>
                    {lastPlayed ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/30 ring-2 ring-slate-700/50 shadow-lg">
                          <Image
                            src={lastPlayed.art || "/placeholder.svg"}
                            alt="Album Art"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg truncate leading-tight">
                            {lastPlayed.title}
                          </h3>
                          <p className="text-white/60 truncate mt-1">{lastPlayed.artist}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/40">No previous track</p>
                    )}
                  </div>

                  {/* Listener Count */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-600/50 rounded-2xl p-6 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-white mb-4">Listeners</h2>
                    <div className="text-5xl font-bold text-white mb-2">{nowPlaying?.listeners.total || 0}</div>
                    <p className="text-white/40 text-sm">Currently tuned in</p>
                  </div>

                  {/* Station Status */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-600/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-white mb-4">Station Status</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-white/60 font-medium">Stream</span>
                        <span className="text-green-400 font-semibold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-white/60 font-medium">Mode</span>
                        <span className="text-white font-semibold">
                          {nowPlaying?.now_playing.is_live ? "Live DJ" : "AutoDJ"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Request Line View */}
            {activeView === "requests" && (
              <div>
                <h1 className="text-4xl font-bold text-white mb-8">Request Line</h1>

                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-white/40 text-center py-12">No requests at the moment</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request, index) => (
                      <div
                        key={`${request.Timestamp}-${index}`}
                        className={`border rounded-2xl p-6 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2 hover:scale-[1.01] ${getRequestColor(request.Type)}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span
                                className={`font-bold text-sm px-3 py-1 rounded-full ${getRequestTextColor(request.Type)} bg-current/10`}
                              >
                                {request.Type}
                              </span>
                              <span className="text-white/60 font-medium">{request.Username}</span>
                              <span className="text-white/40 text-sm">•</span>
                              <span className="text-white/40 text-sm">{request.Source}</span>
                            </div>
                            <p className="text-white text-lg mb-3 leading-relaxed">{request.Message}</p>
                            <p className="text-white/40 text-xs">{new Date(request.Timestamp).toLocaleString()}</p>
                          </div>
                          <Button
                            onClick={() => deleteRequest(request.Timestamp)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timetable View */}
            {activeView === "timetable" && <TimetableDisplay />}

            {/* DJ Bible View */}
            {activeView === "bible" && selectedBiblePage && (
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{selectedBiblePage.title}</h1>
                <p className="text-white/40 text-sm mb-6">By {selectedBiblePage.author}</p>

                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedBiblePage.content }}
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                />
              </div>
            )}

            {activeView === "bible" && !selectedBiblePage && !loadingBible && (
              <div className="text-center py-12 text-white/40">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No DJ Bible pages available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
