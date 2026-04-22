import { apiFetch } from "./client"

export const getReview = (thread_id: string) => apiFetch("/review/" + thread_id)
export const resume = (thread_id: string, approved: boolean) =>
  apiFetch("/resume/" + thread_id, { method: "POST", body: JSON.stringify({ approved }) })