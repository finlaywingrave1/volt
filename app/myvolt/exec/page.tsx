"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { ExecutiveSidebar } from "@/components/executive-sidebar"
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

export default function ExecutiveAreaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [stationData, setStationData] = useState<any>({ backend_running: true, frontend_running: true })
  const [listeners, setListeners] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const accessLevel = localStorage.getItem("dj_AccessLevel")

    if (!accessLevel) {
      router.push("/myvolt/login")
      return
    }

    if (accessLevel !== "Executive") {
      router.push("/myvolt")
      return
    }

    setIsAuthorized(true)
    fetchData()

    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [router])

  const fetchData = async () => {
    try {
      const [statusRes, nowPlayingRes, listenersRes, requestsRes] = await Promise.all([
        fetch("/api/station/status"),
        fetch("/api/station/nowplaying"),
        fetch("/api/station/listeners"),
        fetch("/api/station/requests"),
      ])

      if (statusRes.ok && nowPlayingRes.ok) {
        const [statusData, npData] = await Promise.all([statusRes.json(), nowPlayingRes.json()])

        const combinedData = {
          ...statusData,
          ...npData,
          backend_running: npData.stationStatus?.backendRunning ?? statusData.backend_running,
          frontend_running: npData.stationStatus?.frontendRunning ?? statusData.frontend_running,
        }

        setStationData(combinedData)
      }

      if (listenersRes.ok) {
        const listenersData = await listenersRes.json()
        setListeners(Array.isArray(listenersData) ? listenersData : [])
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(Array.isArray(requestsData) ? requestsData : [])
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
          <ExecutiveSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full max-w-7xl mx-auto">
              <div className="mb-6">
                <MiniPlayer />
              </div>

              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {activeSection === "dashboard" && "Executive Dashboard"}
                      {activeSection === "listeners" && "Listener Statistics"}
                      {activeSection === "reports" && "Station Reports"}
                      {activeSection === "performance" && "Performance Metrics"}
                      {activeSection === "requests" && "Song Requests"}
                    </h1>
                    <p className="text-slate-400 text-sm">
                      {activeSection === "dashboard" && "Real-time station overview"}
                      {activeSection === "listeners" && "Detailed listener analytics"}
                      {activeSection === "reports" && "Historical data and insights"}
                      {activeSection === "performance" && "System performance monitoring"}
                      {activeSection === "requests" && "Manage listener song requests"}
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

                {activeSection === "dashboard" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Station Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stationData?.backend_running ? (
                              <span className="text-green-400">Online</span>
                            ) : (
                              <span className="text-red-400">Offline</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Total Listeners</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-white">{stationData?.listeners?.total || 0}</div>
                          <p className="text-xs text-slate-500 mt-1">{stationData?.listeners?.unique || 0} unique</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Live Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stationData?.live?.is_live ? (
                              <span className="text-green-400">Live</span>
                            ) : (
                              <span className="text-slate-400">AutoDJ</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {stationData?.live?.streamer_name || "Automated"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-400">Connections</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-white">{listeners.length}</div>
                          <p className="text-xs text-slate-500 mt-1">Active</p>
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
                        <CardTitle className="text-white">Mount Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stationData?.station?.mounts && stationData.station.mounts.length > 0 ? (
                          <div className="space-y-2">
                            {stationData.station.mounts.map((mount: any, index: number) => (
                              <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-white font-medium">{mount.name}</p>
                                    <p className="text-sm text-slate-400 font-mono">{replaceInternalUrls(mount.url)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white font-bold">{mount.listeners?.current || 0}</p>
                                    <p className="text-xs text-slate-400">listeners</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-center py-4">No mount points available</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "listeners" && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Active Listeners ({listeners.length})</CardTitle>
                      <CardDescription>Real-time listener connections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">IP Address</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">User Agent</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Duration</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Mount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listeners.length > 0 ? (
                              listeners.map((listener: any, index: number) => (
                                <tr key={index} className="border-b border-slate-700/50">
                                  <td className="py-3 px-4 text-sm text-white">{listener.ip}</td>
                                  <td className="py-3 px-4 text-sm text-slate-300 truncate max-w-xs">
                                    {listener.user_agent}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-300">
                                    {Math.floor(listener.connected_seconds / 60)}m
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-300">{listener.mount_name}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400">
                                  No active listeners
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === "requests" && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Song Requests ({requests.length})</CardTitle>
                      <CardDescription>Listener song requests queue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {requests.length > 0 ? (
                        <div className="space-y-2">
                          {requests.map((request: any, index: number) => (
                            <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                              <p className="text-white font-medium">{request.track?.title || "Unknown"}</p>
                              <p className="text-sm text-slate-400">{request.track?.artist || "Unknown Artist"}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No pending requests</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {(activeSection === "reports" || activeSection === "performance") && (
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
