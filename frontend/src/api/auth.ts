import { apiFetch } from "./client"


// auth.ts
export const login = async (username: string, password: string) => {
  if (!username || !password) {
    throw new Error("Username and password are required")
  }

  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    })
    
    return response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle specific error cases
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      throw new Error("Invalid username or password")
    }
    
    if (error.message?.includes("422")) {
      throw new Error("Invalid request format")
    }
    
    if (error.message?.includes("429")) {
      throw new Error("Too many attempts. Please try again later.")
    }
    
    // Network errors
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
      throw new Error("Network error. Please check your connection.")
    }
    
    // Default error
    throw new Error(error.message || "Login failed. Please try again.")
  }
}

export const register = (username: string, email: string, password: string) =>
  apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password })
  })

export const logout = () => {
  apiFetch("/auth/logout", { method: "POST" })
  localStorage.clear()
  window.location.href = "/login"
}