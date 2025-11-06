import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`https://api.finlayw.cloud/v1/volt/moderators/warnings/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to delete warning" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting warning:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
