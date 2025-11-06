import { NextResponse } from "next/server"

const API_KEY = "d2b6feb38480f05c:27611ca9c2fa854dca00701206dd6d78"
const BASE_URL = "https://manage.voltradio.lol/api"

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/station/1/playlists`, {
      headers: {
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Playlists fetch failed:", response.status, errorText)
      return NextResponse.json({ error: "Failed to fetch playlists", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Playlists error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
