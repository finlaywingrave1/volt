import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const response = await fetch(`https://api.finlayw.cloud/v1/volt/moderators/fcheck/${params.userId}`, {
      headers: {
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch moderation history" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching moderation history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
