import { NextResponse } from "next/server"

const API_BASE = "https://manage.voltradio.lol/api"
const API_KEY = "d2b6feb38480f05c:27611ca9c2fa854dca00701206dd6d78"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/station/1/streamers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Failed to fetch streamers. Status: ${response.status}, Body: ${errorText}`)
      return NextResponse.json({ error: "Failed to fetch streamers" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching streamers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/station/1/streamers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Failed to create streamer. Status: ${response.status}, Body: ${errorText}`)
      return NextResponse.json({ error: errorText || "Failed to create streamer" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error creating streamer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
