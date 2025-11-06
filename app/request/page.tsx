"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react"
import { NavigationButtons } from "@/components/navigation-buttons"
import { MiniPlayer } from "@/components/mini-player"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useUser } from "@auth0/nextjs-auth0"

export default function RequestPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [username, setUsername] = useState("")
  const [requestType, setRequestType] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setUsername(user.name || user.nickname || user.email || "")
    }
  }, [user])

  const goBack = () => {
    window.location.href = "/"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitSuccess(false)

    if (!username.trim()) {
      setError("Please enter your name")
      return
    }

    if (!requestType) {
      setError("Please select a request type")
      return
    }

    if (!message.trim()) {
      setError("Please enter a message")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting request:", { username, requestType, message })

      const now = new Date()
      now.setMilliseconds(0)
      const timestamp = now.toISOString()

      const response = await fetch("https://api.finlayw.cloud/v1/volt/request/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        body: JSON.stringify({
          Username: username,
          Type: requestType,
          Message: message,
          Timestamp: timestamp,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Error response:", errorText)
        throw new Error(`Failed to submit request: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Success response:", data)

      setSubmitSuccess(true)
      setUsername(user?.name || user?.nickname || user?.email || "")
      setRequestType("")
      setMessage("")

      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (err) {
      console.error("[v0] Submit error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      {/* Navigation */}
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Mini Player */}
          <div className="mb-6">
            <MiniPlayer />
          </div>

          {/* Request Form Card */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Submit a Request</h1>
            <p className="text-white/60 text-center mb-8">
              Send us a request, message, shoutout, or competition answer
            </p>

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 bg-green-600/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-semibold text-sm">Request submitted successfully!</p>
                  <p className="text-green-300/70 text-xs">We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-600/20 border border-red-500/30 rounded-2xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80 text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:border-blue-500/50 focus:ring-blue-500/20"
                  disabled={isSubmitting}
                />
              </div>

              {/* Request Type Field */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white/80 text-sm font-medium">
                  Request Type
                </Label>
                <Select value={requestType} onValueChange={setRequestType} disabled={isSubmitting}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-blue-500/50 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select a request type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
                    <SelectItem value="Request" className="hover:bg-white/10">
                      Request
                    </SelectItem>
                    <SelectItem value="Message" className="hover:bg-white/10">
                      Message
                    </SelectItem>
                    <SelectItem value="Shoutout" className="hover:bg-white/10">
                      Shoutout
                    </SelectItem>
                    <SelectItem value="Competition Answer" className="hover:bg-white/10">
                      Competition Answer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/80 text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder={
                    requestType === "Request"
                      ? "e.g., Please play 'Electric Feel' by MGMT"
                      : requestType === "Shoutout"
                        ? "e.g., Shoutout to my friend Sarah!"
                        : requestType === "Competition Answer"
                          ? "Enter your competition answer here"
                          : "Enter your message here"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl min-h-32 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-semibold text-base transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Copyright */}
          <div className="text-center mt-6">
            <p className="text-white/30 text-xs font-bold">© VoltRadio 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
