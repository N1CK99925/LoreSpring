import { apiFetch } from "./client"

export const generateChapter = (project_id: string, chapter_number: number, user_direction: string, style_type: string, style_input: string) =>
  apiFetch("/generate", { method: "POST", body: JSON.stringify({ project_id, chapter_number, user_direction, style_type, style_input }) })