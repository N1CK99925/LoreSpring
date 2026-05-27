/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "./client"

export const getReview = (thread_id: string) => apiFetch("/review/" + thread_id)
export const resume = (thread_id: string, approved: boolean, chapterText: string) =>
  apiFetch("/resume/" + thread_id, { method: "POST", body: JSON.stringify({ approved,chapterText }) })

export const checkPipelineStatus = async (thread_id: string) => {
  try {
    // Try to get the review — if it succeeds, pipeline is STILL RUNNING
    const data = await getReview(thread_id)
    return { isComplete: false, data }
  } catch (error: any) {
    // If we get a 400 "No pending interrupt" — pipeline is DONE
    if (error.message?.includes("No pending interrupt")) {
      return { isComplete: true, data: null }
    }
    // Any other error — rethrow so caller handles it
    throw error
  }
}