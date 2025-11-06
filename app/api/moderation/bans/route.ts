import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch("https://api.finlayw.cloud/v1/volt/moderators/bans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error issuing ban:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
