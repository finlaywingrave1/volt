"use client"

// Custom hook to fetch user session from secure server-side session
import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface UseSessionReturn {
  user: User | null
  isLoading: boolean
  error: Error | null
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session")

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch session"))
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { user, isLoading, error }
}
