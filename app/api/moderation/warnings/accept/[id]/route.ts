export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await fetch(`https://api.finlayw.cloud/v1/volt/moderators/warnings/accept/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
    })

    if (!response.ok) {
      return Response.json({ error: "Failed to accept warning" }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("[v0] Error accepting warning:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
