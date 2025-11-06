import { NextResponse } from "next/server"

// Store the last tracked song in memory (will reset on deployment, but that's acceptable)
let lastTrackedSong: { title: string; artist: string } | null = null

async function safeJsonParse(response: Response) {
  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    console.log("[v0] Non-JSON response received:", text.substring(0, 200))
    throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}`)
  }

  try {
    return await response.json()
  } catch (error) {
    const text = await response.text()
    console.error("[v0] Failed to parse JSON:", text.substring(0, 200))
    throw new Error(`Invalid JSON response: ${error}`)
  }
}

export async function GET() {
  try {
    const response = await fetch("https://manage.voltradio.lol/api/nowplaying/voltradio", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Now playing API error:", response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await safeJsonParse(response)

    const artist = data.now_playing?.song?.artist || "Unknown Artist"
    const title = data.now_playing?.song?.title || "Unknown Track"
    const streamer = data.live?.streamer_name || null
    const isLive = data.live?.is_live || false

    const currentSong = { title, artist }

    console.log("[v0] Current song:", currentSong)
    console.log("[v0] Last tracked song:", lastTrackedSong)

    const historyResponse = await fetch("https://api.finlayw.cloud/v1/volt/songhistory/recent", {
      method: "GET",
      headers: {
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
    })

    let latestDbSong: { title: string; artist: string } | null = null

    if (historyResponse.ok) {
      try {
        const historyData = await safeJsonParse(historyResponse)
        console.log("[v0] Database response (first song):", historyData[0])

        if (Array.isArray(historyData) && historyData.length > 0) {
          const mostRecentSong = historyData[0]
          latestDbSong = {
            title: mostRecentSong.Title,
            artist: mostRecentSong.Artist,
          }
        }
      } catch (error) {
        console.error("[v0] Failed to parse history response:", error)
      }
    } else {
      const errorText = await historyResponse.text()
      console.log("[v0] Database fetch failed:", historyResponse.status, errorText)
    }

    console.log("[v0] Latest DB song:", latestDbSong)

    const normalizeString = (str: string) => str.trim().toLowerCase()

    const isSongInDb =
      latestDbSong &&
      normalizeString(latestDbSong.title) === normalizeString(currentSong.title) &&
      normalizeString(latestDbSong.artist) === normalizeString(currentSong.artist)

    console.log("[v0] Is song in DB?", isSongInDb)

    // Check if song has changed from last tracked
    const isSongChanged = !lastTrackedSong || lastTrackedSong.title !== title || lastTrackedSong.artist !== artist

    console.log("[v0] Has song changed?", isSongChanged)

    if (isSongChanged && !isSongInDb && title !== "Unknown Track" && artist !== "Unknown Artist") {
      const playedBy = isLive && streamer ? streamer : "AutoDJ"

      console.log("[v0] Submitting song to history:", currentSong, "played by:", playedBy)

      const submitResponse = await fetch("https://api.finlayw.cloud/v1/volt/songhistory/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
        },
        body: JSON.stringify({
          Title: title,
          Artist: artist,
          PlayedBy: playedBy,
        }),
      })

      if (submitResponse.ok) {
        try {
          const result = await safeJsonParse(submitResponse)
          console.log("[v0] Song submitted successfully:", result)

          // Update last tracked song
          lastTrackedSong = currentSong

          return NextResponse.json({
            success: true,
            message: "Song submitted to history",
            song: currentSong,
            playedBy,
          })
        } catch (error) {
          console.error("[v0] Failed to parse submit response:", error)
          // Still consider it a success if the status was OK
          lastTrackedSong = currentSong
          return NextResponse.json({
            success: true,
            message: "Song submitted to history (response parse failed)",
            song: currentSong,
            playedBy,
          })
        }
      } else {
        const errorText = await submitResponse.text()
        console.error("[v0] Failed to submit song to history:", errorText)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to submit to history",
            details: errorText,
          },
          { status: 500 },
        )
      }
    } else {
      lastTrackedSong = currentSong

      const reason = isSongInDb ? "Song already in database" : "Same song still playing"
      console.log("[v0] Not submitting:", reason)

      return NextResponse.json({
        success: true,
        message: reason,
        song: currentSong,
      })
    }
  } catch (error) {
    console.error("[v0] Error in song tracking:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track song",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
