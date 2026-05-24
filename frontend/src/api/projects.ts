import { apiFetch } from "./client"

export const getProjects = () => apiFetch("/projects")
export const getProject = (id: string) => apiFetch("/projects/" + id)
export const createProject = (title: string, description: string, genre: string, tone: string, style: string) =>
  apiFetch("/projects", { method: "POST", body: JSON.stringify({ title, description, genre, tone, style }) })