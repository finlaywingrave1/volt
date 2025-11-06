"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { useToast } from "@/hooks/use-toast"
import { Send, CheckCircle, Clock } from "lucide-react"
import { useUser } from "@auth0/nextjs-auth0"

interface ApplicationStatus {
  ApplicationID: number
  UserID: number
  DiscordUsername: string
  Answer1: string
  Answer2: string
  Answer3: string
  Status: string
  SubmittedAt: string
  Comments: Array<{
    CommentID: number
    CommentedBy: string
    CommentText: string
    Timestamp: string
  }>
}

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState<ApplicationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    discordUsername: "",
    answer1: "",
    answer2: "",
    answer3: "",
  })

  useEffect(() => {
    const checkExistingApplication = async () => {
      const savedAppId = localStorage.getItem("voltApplicationID")
      if (savedAppId) {
        try {
          const response = await fetch(`https://api.finlayw.cloud/v1/volt/applications/get/${savedAppId}`, {
            headers: {
              Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
            },
          })
          if (response.ok) {
            const data = await response.json()
            setApplicationData(data)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error("[v0] Failed to fetch application:", error)
        }
      }
      setIsLoading(false)
    }

    if (!authLoading) {
      checkExistingApplication()
    }
  }, [authLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user || !user.sub) {
        toast({
          title: "Error",
          description: "You must be logged in to apply",
          variant: "destructive",
        })
        router.push("/api/auth/login")
        return
      }

      const payload = {
        UserID: user.sub,
        DiscordUsername: formData.discordUsername,
        Answer1: formData.answer1,
        Answer2: formData.answer2,
        Answer3: formData.answer3,
      }

      const response = await fetch("https://api.finlayw.cloud/v1/volt/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("voltApplicationID", data.ApplicationID.toString())
        toast({
          title: "Success",
          description: "Your application has been submitted!",
        })
        setApplicationData(null)
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to submit application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to submit application:", error)
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-white/60">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      <div className="absolute top-4 left-4 z-20">
        <NavigationButtons showVolumeToggle={true} />
      </div>

      <div className="relative z-10 min-h-screen pt-20 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <MiniPlayer />
          </div>

          {applicationData ? (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-600/20 rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Application Status</h1>
                  <p className="text-white/60">Application ID: #{applicationData.ApplicationID}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-sm font-medium mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        applicationData.Status === "Accepted"
                          ? "bg-green-500"
                          : applicationData.Status === "Denied"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <p className="text-white font-semibold">{applicationData.Status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-white/60 text-sm font-medium mb-2">Discord Username</p>
                    <p className="text-white">{applicationData.DiscordUsername}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-white/60 text-sm font-medium mb-2">Submitted</p>
                    <p className="text-white">{new Date(applicationData.SubmittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-sm font-medium mb-3">Your Answers</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">Why do you wish to join the volt team?</p>
                      <p className="text-white/60 text-sm">{applicationData.Answer1}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">Please list any relevant experience</p>
                      <p className="text-white/60 text-sm">{applicationData.Answer2}</p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">
                        Please provide us with a link to your demo
                      </p>
                      <p className="text-white/60 text-sm break-all">{applicationData.Answer3}</p>
                    </div>
                  </div>
                </div>

                {applicationData.Comments && applicationData.Comments.length > 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-white/60 text-sm font-medium mb-3">Comments</p>
                    <div className="space-y-3">
                      {applicationData.Comments.map((comment) => (
                        <div key={comment.CommentID} className="bg-black/20 rounded-lg p-3 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white/80 font-semibold">{comment.CommentedBy}</p>
                            <p className="text-white/40 text-xs">{new Date(comment.Timestamp).toLocaleDateString()}</p>
                          </div>
                          <p className="text-white/60 text-sm">{comment.CommentText}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-300 font-semibold text-sm">We've received your application</p>
                        <p className="text-blue-200/60 text-xs mt-1">
                          Someone will begin reviewing it soon. Thank you for your patience!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Join the Volt Team</h1>
                <p className="text-white/60">
                  Interested in joining VoltRadio? Fill out the form below and let us know why you'd be perfect for our
                  team.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/80 font-semibold mb-2">Discord Username</label>
                  <Input
                    type="text"
                    name="discordUsername"
                    value={formData.discordUsername}
                    onChange={handleInputChange}
                    placeholder="your_discord_username"
                    required
                    className="bg-black/30 border-white/20 text-white placeholder:text-white/40 rounded-xl h-10"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-2">
                    Why do you wish to join the volt team?
                  </label>
                  <Textarea
                    name="answer1"
                    value={formData.answer1}
                    onChange={handleInputChange}
                    placeholder="Tell us why you'd like to join VoltRadio..."
                    required
                    className="bg-black/30 border-white/20 text-white placeholder:text-white/40 rounded-xl min-h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-2">Please list any relevant experience</label>
                  <Textarea
                    name="answer2"
                    value={formData.answer2}
                    onChange={handleInputChange}
                    placeholder="Share your DJ, streaming, or radio experience..."
                    required
                    className="bg-black/30 border-white/20 text-white placeholder:text-white/40 rounded-xl min-h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-2">
                    Please provide us with a link to your demo
                  </label>
                  <Input
                    type="url"
                    name="answer3"
                    value={formData.answer3}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/... or similar"
                    required
                    className="bg-black/30 border-white/20 text-white placeholder:text-white/40 rounded-xl h-10"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-white/30 text-xs font-bold">© VoltRadio 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
