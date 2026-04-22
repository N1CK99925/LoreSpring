import { apiFetch } from "./client"

export const login = async (username: string, password: string) => {
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password })
  })
  return response.json()
}

export const register = (username: string, email: string, password: string) =>
  apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ username, email, password }) })

export const logout = () => {
  apiFetch("/auth/logout", { method: "POST" })
  localStorage.clear()
  window.location.href = "/login"
}