export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    const response = await fetch(`https://api.finlayw.cloud/v1/volt/moderators/check/${userId}`, {
      headers: {
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
    })

    if (!response.ok) {
      return Response.json({ error: "Failed to check moderation status" }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("[v0] Error checking moderation status:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
