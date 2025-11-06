"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useUser } from "@auth0/nextjs-auth0"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

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
          </div>

          {/* Login Card */}
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome to VoltRadio</h1>
                <p className="text-white/60">Sign in to access your account</p>
              </div>

              <a href="/api/auth/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition-colors duration-200">
                  Sign In with Auth0
                </Button>
              </a>

              <p className="text-white/40 text-sm">New users will be automatically registered on first login</p>
            </div>
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
