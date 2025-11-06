import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ModerationCheck } from "@/components/moderation-check"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "VoltRadio",
  description: "VoltRadio - Your favorite online radio station",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VoltRadio",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.webp",
    apple: "/icon-192.webp",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VoltRadio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-192.webp" />
      </head>
      <body className={`${poppins.className} font-poppins`} style={{ fontFeatureSettings: '"ss01" 1, "cv01" 1' }}>
        <ModerationCheck />
        {children}
      </body>
    </html>
  )
}
