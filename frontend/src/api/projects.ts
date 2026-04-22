import { apiFetch } from "./client"

export const getProjects = () => apiFetch("/projects/projects")
export const getProject = (id: string) => apiFetch("/projects/projects/" + id)
export const createProject = (title: string, description: string) =>
  apiFetch("/projects/projects", { method: "POST", body: JSON.stringify({ title, description }) })