// Spotify API integration utilities

interface SpotifyToken {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: number
}

let cachedToken: SpotifyToken | null = null

const SPOTIFY_CLIENT_ID = "8c0b70bfe358484890bf70d0b455c0ca"
const SPOTIFY_CLIENT_SECRET = "93022bed7e624d6891ba2668e05d1b66"

// Get Spotify access token using client credentials flow
export async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify token")
  }

  const data = await response.json()
  cachedToken = {
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute for safety
  }

  return cachedToken.access_token
}

// Search for a track on Spotify and get album art
export async function getSpotifyAlbumArt(artist: string, title: string): Promise<string> {
  try {
    const token = await getSpotifyToken()
    const query = encodeURIComponent(`track:${title} artist:${artist}`)

    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Spotify search failed")
    }

    const data = await response.json()
    const track = data.tracks?.items?.[0]

    if (track?.album?.images?.[0]?.url) {
      return track.album.images[0].url
    }

    return "/fallback-logo.webp"
  } catch (error) {
    console.error("Failed to fetch Spotify album art:", error)
    return "/fallback-logo.webp"
  }
}

// Submit song to history API
export async function submitSongToHistory(title: string, artist: string, playedBy: string): Promise<void> {
  try {
    console.log("[v0] Starting song submission to history")
    console.log("[v0] Song details:", { title, artist, playedBy })
    console.log("[v0] API endpoint: https://api.finlayw.cloud/v1/volt/songhistory/add")

    const requestBody = {
      Title: title,
      Artist: artist,
      PlayedBy: playedBy,
    }
    console.log("[v0] Request body:", JSON.stringify(requestBody))

    const response = await fetch("https://api.finlayw.cloud/v1/volt/songhistory/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response ok:", response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Failed to submit song, status:", response.status)
      console.error("[v0] Error response body:", errorText)
      throw new Error(`Failed to submit song to history: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Successfully submitted song to history")
    console.log("[v0] API response:", result)
  } catch (error) {
    console.error("[v0] Error submitting song to history:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
  }
}

// Get recent songs from history API
export interface RecentSong {
  SongID: number
  Title: string
  Artist: string
  PlayedBy: string
  PlayedAt: string
  albumArt?: string
}

export async function getRecentSongs(limit = 5): Promise<RecentSong[]> {
  try {
    const response = await fetch("https://api.finlayw.cloud/v1/volt/songhistory/recent", {
      headers: {
        Authorization: "Bearer VoltRadio_DEVSERVER_F4gg0trys1mul4t0r",
      },
    })

    if (!response.ok) {
      console.error("API returned error status:", response.status)
      return []
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API returned non-JSON response")
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.error("API returned invalid data format")
      return []
    }

    const songs = data.slice(0, limit)

    // Fetch album art for each song
    const songsWithArt = await Promise.all(
      songs.map(async (song: RecentSong) => {
        const albumArt = await getSpotifyAlbumArt(song.Artist, song.Title)
        return {
          ...song,
          albumArt,
        }
      }),
    )

    return songsWithArt
  } catch (error) {
    console.error("Failed to fetch recent songs:", error)
    // Return empty array instead of throwing to prevent UI crashes
    return []
  }
}
