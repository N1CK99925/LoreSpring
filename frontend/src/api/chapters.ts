import { apiFetch } from "./client"

export const getChapters = (project_id: string) => apiFetch("/chapters/chapters/" + project_id)