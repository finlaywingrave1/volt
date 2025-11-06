"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@auth0/nextjs-auth0"

// Discord SVG Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.4-2.172-1.27-2.172-1.27s.135.064.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.27.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34.002-.74.573-1.338 1.27-1.335zm-4.64 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34 0-.74.57-1.335 1.27-1.335z" />
  </svg>
)

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [userId, setUserId] = useState("")
  const [fullName, setFullName] = useState("")
  const [description, setDescription] = useState("")
  const [profileUrl, setProfileUrl] = useState("")
  const [userRole, setUserRole] = useState("")
  const [linkedDiscordUsername, setLinkedDiscordUsername] = useState("")
  const [linkedDiscordUserId, setLinkedDiscordUserId] = useState("")

  useEffect(() => {
    if (user) {
      const auth0UserId = user.sub || ""
      setUserId(auth0UserId)
      setFullName(user.name || "")
      setDescription(user.user_metadata?.description || "")
      setProfileUrl(user.picture || "")
      setUserRole(user.user_metadata?.role || "User")

      if (auth0UserId) {
        fetchUserData(auth0UserId)
      }
    }
  }, [user])

  const fetchUserData = async (id: string) => {
    setIsLoading(true)
    try {
      console.log("[v0] Fetching user data for ID:", id)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`https://api.finlayw.cloud/v1/volt/users/${id}`, {
        headers: {
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Fetch response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] User data fetched successfully:", data)
        setLinkedDiscordUsername(data.LinkedDiscordUsername || "")
        setLinkedDiscordUserId(data.LinkedDiscordUserID || "")
      } else {
        console.warn("[v0] Fetch returned non-ok status:", response.status)
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.warn("[v0] Fetch request timed out")
      } else {
        console.warn("[v0] Failed to fetch user data (non-critical):", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      console.log("[v0] Sending update request to API with data:", {
        FullName: fullName,
        Description: description,
        profileUrl: profileUrl,
        LinkedDiscordUsername: linkedDiscordUsername,
        LinkedDiscordUserID: linkedDiscordUserId,
      })

      const response = await fetch(`https://api.finlayw.cloud/v1/volt/users/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        body: JSON.stringify({
          FullName: fullName,
          Description: description,
          profileUrl: profileUrl,
          LinkedDiscordUsername: linkedDiscordUsername,
          LinkedDiscordUserID: linkedDiscordUserId,
        }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      let responseData: any

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        const textData = await response.text()
        console.log("[v0] Non-JSON response:", textData)
        responseData = { message: textData }
      }

      console.log("[v0] Response data:", responseData)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: responseData.message || `Failed to update profile (Status: ${response.status})`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update profile:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectDiscord = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    const discordOAuthUrl = `https://discord.com/oauth2/authorize?client_id=1434744747611783188&redirect_uri=https%3A%2F%2Fapi.finlayw.cloud%2Fcallback%2Fdiscord&response_type=code&scope=identify&state=${userId}`
    window.location.href = discordOAuthUrl
  }

  const handleBack = () => {
    router.back()
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={handleBack} variant="ghost" className="text-white/60 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-white/60">Manage your VoltRadio profile information</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-white/60">Update your profile details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Bio / Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileUrl" className="text-white">
                Profile Picture URL
              </Label>
              <Input
                id="profileUrl"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://example.com/profile.jpg"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRole" className="text-white">
                User Role
              </Label>
              <Input
                id="userRole"
                value={userRole}
                readOnly
                disabled
                className="bg-white/5 border-white/10 text-white/60 cursor-not-allowed"
              />
              <p className="text-xs text-white/40">User role cannot be changed</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <Label className="text-white mb-3 block">Discord Connection</Label>
                {linkedDiscordUsername ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80">
                      <DiscordIcon className="w-5 h-5 text-purple-400" />
                      <span className="font-medium">{linkedDiscordUsername}</span>
                    </div>
                    {linkedDiscordUserId && <p className="text-xs text-white/40">ID: {linkedDiscordUserId}</p>}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm mb-3">No Discord account connected</p>
                )}
              </div>
              <Button onClick={handleConnectDiscord} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <DiscordIcon className="w-4 h-4 mr-2" />
                {linkedDiscordUsername ? "Reconnect Discord" : "Connect to Discord"}
              </Button>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
