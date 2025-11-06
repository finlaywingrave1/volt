"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface DJData {
  DJID: number
  UserID: number
  DJName: string
  Username: string
  ProfilePicture: string
  AccessLevel: string
  Status?: string
}

export default function MyVoltLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<"loading" | "checking" | "denied">("loading")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const checkDJAccess = async () => {
      if (isLoading) return

      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }

    checkDJAccess()
  }, [isLoading])

  const handleStaffLogin = () => {
    // Redirect to Auth0 Universal Login via staff auth endpoint
    window.location.href = "/myvolt/api/auth/login"
  }

  useEffect(() => {
    if (step === "denied" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (step === "denied" && countdown === 0) {
      router.push("/")
    }
  }, [step, countdown, router])

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-['Poppins']">
      {/* Blurred Background */}
      <div
        className="absolute inset-0"
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="https://api.finlayw.cloud/v1/imagecdn/volt/public/voltradio-logo.png"
              alt="VoltRadio"
              width={200}
              height={60}
              className="mx-auto opacity-80 cursor-pointer hover:opacity-100 transition-opacity duration-200"
              onClick={() => router.push("/")}
              draggable="false"
              priority
            />
            <h1 className="text-2xl font-bold text-white mt-4">MyVolt Staff Login</h1>
          </div>

          {/* Login Card */}
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {isLoading ? (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
                <p className="text-white/60">Preparing login...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white/70 text-sm text-center mb-6">
                  Sign in with your Auth0 credentials to access the staff dashboard.
                </p>
                <Button
                  onClick={handleStaffLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Sign In with Auth0
                </Button>
                <p className="text-white/50 text-xs text-center mt-4">Don't have access? Contact management.</p>
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              Back to Home
            </Button>
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
