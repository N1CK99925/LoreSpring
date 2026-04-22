const BASE_URL = "http://localhost:8000"

export const getToken = () => localStorage.getItem("access_token")

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token = getToken()
  const headers: any = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const response = await fetch(BASE_URL + endpoint, {
    ...options,
    headers: { ...headers, ...options.headers }
  })

  if (response.status === 401) {
    localStorage.clear()
    window.location.href = "/login"
    return
  }

  return response.json()
}