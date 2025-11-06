"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Shield, Music2, Clock } from "lucide-react"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { getRecentSongs, type RecentSong } from "@/lib/spotify"

interface UserData {
  AccountCreated: string
  DOB: string
  Description: string
  FullName: string
  UserID: number
  UserRole: string
  Username: string
  isExecutive: boolean
  isManager: boolean
  isStaff: boolean
  profileUrl: string
  Verified?: boolean
}

const sanitizeHTML = (html: string): string => {
  // Create a temporary div to parse HTML
  const temp = document.createElement("div")
  temp.innerHTML = html

  // Allowed tags
  const allowedTags = ["br", "b", "i", "u", "strong", "em", "span", "a", "p"]

  // Function to recursively clean nodes
  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()

      // If tag is not allowed, return its text content
      if (!allowedTags.includes(tagName)) {
        return document.createTextNode(element.textContent || "")
      }

      // For anchor tags, only keep href attribute and sanitize it
      if (tagName === "a") {
        const href = element.getAttribute("href")
        if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
          element.setAttribute("href", href)
          element.setAttribute("target", "_blank")
          element.setAttribute("rel", "noopener noreferrer")
        } else {
          // Invalid href, convert to span
          const span = document.createElement("span")
          span.innerHTML = element.innerHTML
          return span
        }
      }

      // Remove all attributes except href for links
      const attributes = Array.from(element.attributes)
      attributes.forEach((attr) => {
        if (!(tagName === "a" && (attr.name === "href" || attr.name === "target" || attr.name === "rel"))) {
          element.removeAttribute(attr.name)
        }
      })

      // Clean child nodes
      const children = Array.from(element.childNodes)
      element.innerHTML = ""
      children.forEach((child) => {
        const cleanedChild = cleanNode(child)
        if (cleanedChild) {
          element.appendChild(cleanedChild)
        }
      })

      return element
    }

    return null
  }

  // Clean all nodes
  const children = Array.from(temp.childNodes)
  temp.innerHTML = ""
  children.forEach((child) => {
    const cleanedChild = cleanNode(child)
    if (cleanedChild) {
      temp.appendChild(cleanedChild)
    }
  })

  return temp.innerHTML
}

function ProfileContent() {
  const searchParams = useSearchParams()
  const userID = searchParams.get("userID")

  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [userRecentSongs, setUserRecentSongs] = useState<RecentSong[]>([])
  const [loadingRecentSongs, setLoadingRecentSongs] = useState(false)

  useEffect(() => {
    if (!userID) {
      setError("No user ID provided")
      setIsLoading(false)
      return
    }

    const fetchUserData = async () => {
      try {
        console.log("[v0] Fetching user data for ID:", userID)
        const response = await fetch(`https://api.finlayw.cloud/v1/volt/users/user/${userID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("[v0] Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("[v0] Error response:", errorText)
          throw new Error(`Failed to fetch user data: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] User data received:", data)
        setUserData(data)
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Fetch error:", err)
        setError(err instanceof Error ? err.message : "Network error - Unable to connect to server")
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userID])

  useEffect(() => {
    if (userData?.isStaff && userData?.Username) {
      const fetchUserRecentSongs = async () => {
        setLoadingRecentSongs(true)
        try {
          const allSongs = await getRecentSongs(100) // Get more songs to filter
          const userSongs = allSongs.filter((song) => song.PlayedBy === userData.FullName).slice(0, 5)
          setUserRecentSongs(userSongs)
        } catch (error) {
          console.error("Failed to fetch user recent songs:", error)
        }
        setLoadingRecentSongs(false)
      }

      fetchUserRecentSongs()
      // Update every 30 seconds
      const interval = setInterval(fetchUserRecentSongs, 30000)
      return () => clearInterval(interval)
    }
  }, [userData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

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

  const goBack = () => {
    window.location.href = "/"
  }

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

  if (error || !userData) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
            <p className="text-white/70 mb-6">{error || "User not found"}</p>
            <Button onClick={goBack} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center gap-2">
          <Button
            onClick={goBack}
            variant="ghost"
            size="sm"
            className="text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2 h-10 flex items-center gap-2 transition-all duration-200 hover:text-white/60 hover:bg-black/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium">Back</span>
          </Button>
          <NavigationButtons showVolumeToggle={false} />
        </div>
      </div>

      {/* Profile content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <MiniPlayer />
          </div>

          {/* Profile card */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Profile header */}
            <div className="flex flex-col items-center mb-8">
              {/* Profile picture */}
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                  <Image
                    src={userData.profileUrl || "/placeholder.svg"}
                    alt={userData.FullName}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                {userData.Verified && (
                  <div className="absolute -bottom-1 -right-1 group">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-75 animate-pulse"></div>

                    {/* Badge */}
                    <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-full p-2.5 border-4 border-black shadow-2xl cursor-help transform transition-transform duration-200 hover:scale-110">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-white drop-shadow-lg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.49 4.49 0 01-3.498 1.306 4.491 4.491 0 01-1.307 3.498A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.307 4.49 4.49 0 01-1.307-3.497zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>

                      {/* Enhanced tooltip */}
                      <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs rounded-xl p-3 shadow-2xl border border-slate-700/50 backdrop-blur-sm min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="font-bold text-blue-400">Verified</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">INTERNAL GROUP Member</p>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full right-4 -mt-1">
                            <div className="border-8 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Name and username */}
              <h1 className="text-3xl font-bold text-white mb-2 text-center">{userData.FullName}</h1>
              <p className="text-lg text-white/70 mb-4">@{userData.Username}</p>

              {/* Role badge */}
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-4">
                <span className="text-blue-300 font-semibold text-sm">{userData.UserRole}</span>
              </div>

              {/* Description */}
              {userData.Description && (
                <div
                  className="text-white/80 text-center max-w-md line-clamp-5"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(userData.Description) }}
                />
              )}
            </div>

            {/* Profile details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date of Birth */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600/20 rounded-full p-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium">Date of Birth</p>
                    <p className="text-white font-semibold">{formatDate(userData.DOB)}</p>
                  </div>
                </div>
              </div>

              {/* Account Created */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600/20 rounded-full p-2">
                    <User className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium">Member Since</p>
                    <p className="text-white font-semibold">{formatDate(userData.AccountCreated)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges section */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                Badges & Permissions
              </h3>
              <div className="flex flex-wrap gap-2">
                {userData.Username.startsWith("VOLT_") && (
                  <>
                    <div className="bg-orange-600/20 border border-orange-500/30 rounded-full px-3 py-1">
                      <span className="text-orange-300 text-sm font-medium">Development Account</span>
                    </div>
                    <div className="bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1">
                      <span className="text-red-300 text-sm font-medium">Internal User</span>
                    </div>
                  </>
                )}
                {userData.isStaff && (
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1">
                    <span className="text-blue-300 text-sm font-medium">Staff</span>
                  </div>
                )}
                {userData.isManager && (
                  <div className="bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1">
                    <span className="text-purple-300 text-sm font-medium">Manager</span>
                  </div>
                )}
                {userData.isExecutive && (
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-full px-3 py-1">
                    <span className="text-yellow-300 text-sm font-medium">Executive</span>
                  </div>
                )}
                {!userData.isStaff &&
                  !userData.isManager &&
                  !userData.isExecutive &&
                  !userData.Username.startsWith("VOLT_") && (
                    <div className="bg-gray-600/20 border border-gray-500/30 rounded-full px-3 py-1">
                      <span className="text-gray-300 text-sm font-medium">Member</span>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {userData.isStaff && (
            <div className="mt-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Music2 className="w-5 h-5" />
                Recently Played by {userData.FullName}
              </h3>

              {loadingRecentSongs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRecentSongs.map((song) => (
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
                        <h4 className="text-white font-semibold text-sm truncate">{song.Title}</h4>
                        <p className="text-white/60 text-xs truncate">{song.Artist}</p>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(song.PlayedAt)}
                      </div>
                    </div>
                  ))}

                  {userRecentSongs.length === 0 && (
                    <div className="text-center py-8 text-white/50">
                      <Music2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No recent songs yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Copyright */}
          <div className="text-center mt-6">
            <p className="text-white/30 text-xs font-bold">© VoltRadio 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
