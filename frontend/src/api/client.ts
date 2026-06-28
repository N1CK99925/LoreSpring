/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const getToken = () => localStorage.getItem("access_token")


export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = getToken()
  const headers: any = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const response = await fetch(BASE_URL + endpoint, {
    ...options,
    headers: { ...headers, ...options.headers }
  })


  if (!response.ok) {
    if (response.status === 401) {
      localStorage.clear()
      window.location.href = "/login"
      throw new Error("Unauthorized")
    }
    
   
    let errorData;
    try {
      errorData = await response.json()
    } catch {
      errorData = { detail: "Unknown error" }
    }
    
    
    throw new Error(errorData.detail || `HTTP ${response.status}`)
  }

  return response.json()
}


export const handleApiError = (error: any): string => {
  if (error.message === "Unauthorized") {
    return "Session expired. Please login again."
  }
  return error.message || "Something went wrong"
}