import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { timestamp: string } }) {
  try {
    const { timestamp } = params

    const response = await fetch(`https://api.finlayw.cloud/v1/volt/request/delete/${timestamp}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to delete request: ${response.status} - ${errorText}`)
      return NextResponse.json({ error: "Failed to delete request", details: errorText }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
