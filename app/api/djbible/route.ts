import { NextResponse } from "next/server"

const API_BASE = "https://api.finlayw.cloud/v1/volt/djbible"
const BEARER_TOKEN = "VoltRadio_DEVSERVER_F4gg0trys1mul4t0r"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/getall`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] DJ Bible fetch error:", errorText)
      return NextResponse.json({ error: "Failed to fetch DJ Bible pages" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] DJ Bible fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch DJ Bible pages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] DJ Bible create error:", errorText)
      return NextResponse.json({ error: "Failed to create DJ Bible page" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] DJ Bible create error:", error)
    return NextResponse.json({ error: "Failed to create DJ Bible page" }, { status: 500 })
  }
}
