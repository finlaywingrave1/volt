import { NextResponse } from "next/server"

const API_KEY = "d2b6feb38480f05c:27611ca9c2fa854dca00701206dd6d78"
const BASE_URL = "https://manage.voltradio.lol/api"

export async function POST() {
  try {
    const response = await fetch(`${BASE_URL}/station/1/backend/disconnect`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend disconnect failed:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to disconnect backend", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Backend disconnect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
