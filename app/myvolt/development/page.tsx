"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { DevelopmentSidebar } from "@/components/development-sidebar"
import { ArrowLeft, AlertCircle, Power, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DevelopmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")
  const [stationData, setStationData] = useState<any>({ backend_running: true, frontend_running: true })
  const [playlists, setPlaylists] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const djStatus = localStorage.getItem("dj_Status")

    if (djStatus === "Developer") {
      setIsAuthorized(true)
      fetchData()

      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    } else {
      router.push("/myvolt")
    }
  }, [router])

  const fetchData = async () => {
    try {
      const [statusRes, nowPlayingRes, playlistsRes, filesRes] = await Promise.all([
        fetch("/api/station/status"),
        fetch("/api/station/nowplaying"),
        fetch("/api/station/playlists"),
        fetch("/api/station/files"),
      ])

      if (statusRes.ok && nowPlayingRes.ok) {
        const [statusData, npData] = await Promise.all([statusRes.json(), nowPlayingRes.json()])

        const combinedData = {
          ...statusData,
          ...npData,
          // Override with correct status from nowplaying if available
          backend_running: npData.stationStatus?.backendRunning ?? statusData.backend_running,
          frontend_running: npData.stationStatus?.frontendRunning ?? statusData.frontend_running,
        }

        setStationData(combinedData)
      }

      if (playlistsRes.ok) {
        const playlistData = await playlistsRes.json()
        setPlaylists(Array.isArray(playlistData) ? playlistData : [])
      }

      if (filesRes.ok) {
        const fileData = await filesRes.json()
        setFiles(Array.isArray(fileData) ? fileData : [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleDisconnectStreamer = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch("/api/station/backend/disconnect", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Streamer disconnected successfully",
        })
        setShowDisconnectDialog(false)
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to disconnect streamer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to disconnect:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect streamer",
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const replaceInternalUrls = (text: string) => {
    if (!text) return text
    return text.replace(/https?:\/\/192\.168\.\d+\.\d+/g, "https://manage.voltradio.lol")
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-['Poppins']">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons showVolumeToggle={true} />
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="icon"
          disabled={isRefreshing}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 text-white hover:bg-slate-800/50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button
          onClick={() => router.push("/myvolt")}
          variant="ghost"
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 text-white hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to MyVolt
        </Button>
      </div>

      <div className="relative z-10 min-h-screen pt-20">
        <div className="flex h-[calc(100vh-5rem)]">
          <DevelopmentSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full max-w-7xl mx-auto">
              <div className="mb-6">
                <MiniPlayer />
              </div>

              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {activeSection === "overview" && "System Overview"}
                      {activeSection === "station" && "Station Information"}
                      {activeSection === "files" && "File Manager"}
                      {activeSection === "playlists" && "Playlist Management"}
                      {activeSection === "podcasts" && "Podcast Management"}
                      {activeSection === "logs" && "System Logs"}
                      {activeSection === "debug" && "Debug Console"}
                    </h1>
                    <p className="text-slate-400 text-sm">
                      {activeSection === "overview" && "Real-time system status and metrics"}
                      {activeSection === "station" && "Detailed station configuration"}
                      {activeSection === "files" && "Browse and manage media files"}
                      {activeSection === "playlists" && "Configure playlists and rotation"}
                      {activeSection === "podcasts" && "Manage podcast episodes"}
                      {activeSection === "logs" && "View system and error logs"}
                      {activeSection === "debug" && "Raw API data and debugging tools"}
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowDisconnectDialog(true)}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    disabled={!stationData?.live?.is_live}
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>

                {activeSection === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Backend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stationData?.backend_running ? (
                              <span className="text-green-400">Running</span>
                            ) : (
                              <span className="text-red-400">Stopped</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Frontend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stationData?.frontend_running ? (
                              <span className="text-green-400">Running</span>
                            ) : (
                              <span className="text-red-400">Stopped</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Listeners</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-white">{stationData?.listeners?.total || 0}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stationData?.live?.is_live ? (
                              <span className="text-green-400">Live</span>
                            ) : (
                              <span className="text-slate-400">AutoDJ</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Now Playing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stationData?.now_playing?.song && (
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-white">{stationData.now_playing.song.text}</p>
                            <p className="text-sm text-slate-400">
                              {stationData.now_playing.elapsed}s / {stationData.now_playing.duration}s
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Station URLs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-sm text-slate-400">Listen URL</p>
                          <p className="text-white font-mono text-sm break-all">
                            {replaceInternalUrls(stationData?.station?.listen_url)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Public Player</p>
                          <p className="text-white font-mono text-sm break-all">
                            {replaceInternalUrls(stationData?.station?.public_player_url)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "station" && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Station Configuration</CardTitle>
                      <CardDescription>Detailed station settings and information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Station Name</p>
                          <p className="text-white font-mono">{stationData?.station?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Shortcode</p>
                          <p className="text-white font-mono">{stationData?.station?.shortcode || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Frontend</p>
                          <p className="text-white font-mono">{stationData?.station?.frontend || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Backend</p>
                          <p className="text-white font-mono">{stationData?.station?.backend || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Timezone</p>
                          <p className="text-white font-mono">{stationData?.station?.timezone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Public</p>
                          <p className="text-white font-mono">{stationData?.station?.is_public ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === "playlists" && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Playlists ({playlists.length})</CardTitle>
                      <CardDescription>Manage station playlists and rotation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {playlists.length > 0 ? (
                        <div className="space-y-2">
                          {playlists.map((playlist: any, index: number) => (
                            <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                              <p className="text-white font-medium">{playlist.name}</p>
                              <p className="text-sm text-slate-400">{playlist.type}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No playlists found</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeSection === "files" && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Media Files ({files.length})</CardTitle>
                      <CardDescription>Browse station media library</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {files.length > 0 ? (
                        <div className="space-y-2">
                          {files.slice(0, 20).map((file: any, index: number) => (
                            <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                              <p className="text-white text-sm font-mono truncate">{file.path || file.name}</p>
                            </div>
                          ))}
                          {files.length > 20 && (
                            <p className="text-slate-400 text-sm text-center pt-2">
                              ... and {files.length - 20} more files
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No files found</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeSection === "debug" && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Debug Data</CardTitle>
                      <CardDescription>Raw API response for debugging</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/50">
                        <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(stationData, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(activeSection === "podcasts" || activeSection === "logs") && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="py-12">
                      <p className="text-slate-400 text-center">This section is under development</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Disconnect Current Streamer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will immediately disconnect the current live streamer and switch to AutoDJ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectStreamer}
              disabled={isDisconnecting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
