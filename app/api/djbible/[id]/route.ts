import { NextResponse } from "next/server"

const API_BASE = "https://api.finlayw.cloud/v1/volt/djbible"
const BEARER_TOKEN = "VoltRadio_DEVSERVER_F4gg0trys1mul4t0r"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE}/get/${params.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] DJ Bible get error:", errorText)
      return NextResponse.json({ error: "Failed to fetch DJ Bible page" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] DJ Bible get error:", error)
    return NextResponse.json({ error: "Failed to fetch DJ Bible page" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/update/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] DJ Bible update error:", errorText)
      return NextResponse.json({ error: "Failed to update DJ Bible page" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] DJ Bible update error:", error)
    return NextResponse.json({ error: "Failed to update DJ Bible page" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE}/delete/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] DJ Bible delete error:", errorText)
      return NextResponse.json({ error: "Failed to delete DJ Bible page" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] DJ Bible delete error:", error)
    return NextResponse.json({ error: "Failed to delete DJ Bible page" }, { status: 500 })
  }
}
