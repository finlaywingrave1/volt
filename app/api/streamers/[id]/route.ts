import { NextResponse } from "next/server"

const API_BASE = "https://manage.voltradio.lol/api"
const API_KEY = "d2b6feb38480f05c:27611ca9c2fa854dca00701206dd6d78"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    const response = await fetch(`${API_BASE}/station/1/streamer/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Failed to update streamer. Status: ${response.status}, Body: ${errorText}`)
      return NextResponse.json({ error: errorText || "Failed to update streamer" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating streamer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await fetch(`${API_BASE}/station/1/streamer/${id}`, {
      method: "DELETE",
      headers: {
        "X-API-Key": API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Failed to delete streamer. Status: ${response.status}, Body: ${errorText}`)
      return NextResponse.json({ error: errorText || "Failed to delete streamer" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error deleting streamer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
